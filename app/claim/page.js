"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, auth, googleProvider } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

function ClaimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading: al } = useAuth();
  const [storeId, setStoreId] = useState("");
  const [store, setStore] = useState(null);
  const [status, setStatus] = useState("loading"); // loading, found, claimed, error, login
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Ambil storeId dari URL
  useEffect(() => {
    var id = searchParams.get("id") || searchParams.get("storeId") || "";
    if (id) {
      setStoreId(id);
      loadStore(id);
    } else {
      setStatus("error");
    }
  }, [searchParams]);

  // Cek apakah user sudah login dan sudah punya toko
  useEffect(() => {
    if (al) return;
    if (user && storeId) {
      checkAndClaim();
    }
  }, [user, storeId, al]);

  async function loadStore(id) {
    try {
      var snap = await getDoc(doc(db, "toko", id));
      if (snap.exists()) {
        setStore({ id: snap.id, ...snap.data() });
        // Cek apakah sudah diklaim
        var data = snap.data();
        if (data.pemilikId && !data.pemilikId.startsWith("admin-")) {
          setStatus("claimed");
        } else {
          setStatus("found");
        }
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    }
  }

  async function checkAndClaim() {
    if (!user || !storeId) return;
    try {
      var snap = await getDoc(doc(db, "toko", storeId));
      if (!snap.exists()) { setStatus("error"); return; }
      var data = snap.data();

      // Jika belum diklaim, klaim sekarang
      if (!data.pemilikId || data.pemilikId.startsWith("admin-")) {
        await updateDoc(doc(db, "toko", storeId), {
          pemilikId: user.uid,
          claimedAt: new Date().toISOString(),
        });
        setStatus("success");
      } else if (data.pemilikId === user.uid) {
        // Sudah jadi milik user ini
        setStatus("success");
      } else {
        // Sudah diklaim orang lain
        setStatus("claimed");
      }
    } catch (e) {
      console.error("Claim error:", e);
      setStatus("error");
    }
  }

  async function handleGoogleLogin() {
    setSaving(true); setErr("");
    try {
      await signInWithPopup(auth, googleProvider);
      // checkAndClaim akan dijalankan otomatis oleh useEffect
    } catch (e) {
      setErr("Gagal login Google. Coba lagi.");
    }
    setSaving(false);
  }

  async function handleEmailAuth(e) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (isRegister) {
        if (!nama.trim()) { setErr("Nama wajib diisi"); setSaving(false); return; }
        var c = await createUserWithEmailAndPassword(auth, email, password);
        // Simpan data user
        var { setDoc: sd } = await import("firebase/firestore");
        await sd(doc(db, "users", c.user.uid), {
          nama: nama, email: email, foto: "",
          role: "seller", phone: "", alamat: "",
          createdAt: new Date().toISOString(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // checkAndClaim akan dijalankan otomatis oleh useEffect
    } catch (e) {
      var m = { "auth/email-already-in-use": "Email sudah terdaftar.", "auth/invalid-credential": "Email/password salah.", "auth/weak-password": "Password minimal 6 karakter." };
      setErr(m[e.code] || "Terjadi kesalahan.");
    }
    setSaving(false);
  }

  var inputStyle = { width: "100%", padding: "14px 16px", border: "2px solid #e5e7eb", borderRadius: "14px", fontSize: "14px", outline: "none", background: "#f9fafb" };

  // Loading
  if (status === "loading") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "12px" }}>🏪</div><p style={{ color: "#9ca3af" }}>Memuat...</p></div>
    </div>
  );

  // Error / Toko tidak ditemukan
  if (status === "error") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "white", padding: "24px" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "56px", marginBottom: "12px" }}>😕</div><h2 style={{ fontSize: "20px", fontWeight: 700 }}>Link Tidak Valid</h2><p style={{ color: "#9ca3af", marginTop: "8px" }}>Link klaim toko tidak ditemukan atau sudah kadaluarsa.</p></div>
    </div>
  );

  // Sudah diklaim orang lain
  if (status === "claimed") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "white", padding: "24px" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "56px", marginBottom: "12px" }}>✅</div><h2 style={{ fontSize: "20px", fontWeight: 700 }}>Toko Sudah Diklaim</h2><p style={{ color: "#9ca3af", marginTop: "8px" }}>Toko ini sudah dimiliki oleh penjual lain.</p></div>
    </div>
  );

  // Berhasil klaim!
  if (status === "success") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f59e0b, #ea580c)", padding: "24px" }}>
      <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", marginBottom: "20px" }}>🎉</div>
      <h2 style={{ fontSize: "24px", fontWeight: 900, color: "white" }}>Toko Berhasil Diklaim!</h2>
      <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "8px", textAlign: "center" }}>{store?.nama || "Toko"} sekarang milik Anda.</p>
      <button onClick={function() { router.push("/seller"); }} style={{ marginTop: "28px", padding: "16px 40px", borderRadius: "50px", background: "white", color: "#ea580c", fontWeight: 800, fontSize: "16px", border: "none", cursor: "pointer" }}>Buka Dashboard Seller →</button>
    </div>
  );

  // Halaman login/daftar (default)
  return (
    <div style={{ minHeight: "100vh", background: "white", display: "flex", flexDirection: "column" }}>
      <div style={{ paddingTop: "40px", paddingBottom: "20px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, #f59e0b, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><span style={{ fontSize: "32px", fontWeight: 900, color: "white" }}>L</span></div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#f59e0b" }}>Klaim Toko</h1>
        {store && <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "4px" }}>🏪 {store.nama}</p>}
      </div>

      <div style={{ flex: 1, padding: "0 24px 32px" }}>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>Masuk atau daftar untuk mengklaim toko ini.</p>

        {err && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", padding: "12px", borderRadius: "12px", marginBottom: "14px" }}>⚠️ {err}</div>}

        <button onClick={handleGoogleLogin} disabled={saving} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "14px", border: "2px solid #e5e7eb", borderRadius: "14px", fontWeight: 600, fontSize: "15px", color: "#374151", background: "white", cursor: "pointer", marginBottom: "16px" }}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.1 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 15.6 18.8 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.4 0-9.9-3.6-11.3-8.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.7 39.5 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/></svg>
          Masuk dengan Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "16px 0" }}><div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div><span style={{ color: "#9ca3af", fontSize: "13px" }}>atau pakai email</span><div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div></div>

        <form onSubmit={handleEmailAuth}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {isRegister && <div><label style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", marginBottom: "4px", display: "block" }}>Nama Lengkap</label><input type="text" value={nama} onChange={function(e) { setNama(e.target.value); }} placeholder="Nama Anda" style={inputStyle} /></div>}
            <div><label style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", marginBottom: "4px", display: "block" }}>Email</label><input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} required placeholder="contoh@email.com" style={inputStyle} /></div>
            <div><label style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", marginBottom: "4px", display: "block" }}>Password</label><input type="password" value={password} onChange={function(e) { setPassword(e.target.value); }} required minLength={6} placeholder="Minimal 6 karakter" style={inputStyle} /></div>
            <button type="submit" disabled={saving} style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", fontWeight: 700, fontSize: "16px", cursor: "pointer", marginTop: "4px" }}>{saving ? "Memproses..." : isRegister ? "Daftar & Klaim Toko 🚀" : "Masuk & Klaim Toko →"}</button>
          </div>
        </form>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginTop: "16px" }}>
          {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
          <button onClick={function() { setIsRegister(!isRegister); setErr(""); }} style={{ fontWeight: 700, color: "#f59e0b", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>{isRegister ? "Masuk" : "Daftar"}</button>
        </p>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: "48px", marginBottom: "12px" }}>🏪</div><p style={{ color: "#9ca3af" }}>Memuat...</p></div></div>}>
      <ClaimContent />
    </Suspense>
  );
}
