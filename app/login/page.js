"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true); setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        const d = snap.data();
        router.push(d.role === "seller" ? "/seller" : d.role ? "/buyer" : "/pilih-role");
      } else {
        await setDoc(doc(db, "users", u.uid), {
          nama: u.displayName || "User", email: u.email, foto: u.photoURL || "",
          role: "", phone: "", alamat: "", perumahan: "", createdAt: new Date().toISOString(),
        });
        router.push("/pilih-role");
      }
    } catch (err) { console.error(err); setError("Gagal login Google. Coba lagi."); }
    setLoading(false);
  }

  async function handleEmailAuth(e) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (isRegister) {
        if (!nama.trim()) { setError("Nama harus diisi"); setLoading(false); return; }
        const c = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", c.user.uid), {
          nama, email, foto: "", role: "", phone: "", alamat: "", perumahan: "", createdAt: new Date().toISOString(),
        });
        router.push("/pilih-role");
      } else {
        const c = await signInWithEmailAndPassword(auth, email, password);
        const snap = await getDoc(doc(db, "users", c.user.uid));
        if (snap.exists()) {
          const d = snap.data();
          router.push(!d.role ? "/pilih-role" : d.role === "seller" ? "/seller" : "/buyer");
        } else router.push("/pilih-role");
      }
    } catch (err) {
      const m = { "auth/email-already-in-use": "Email sudah terdaftar.", "auth/invalid-credential": "Email/password salah.", "auth/weak-password": "Password minimal 6 karakter.", "auth/invalid-email": "Email tidak valid." };
      setError(m[err.code] || "Terjadi kesalahan. Coba lagi.");
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%", padding: "14px 16px", border: "2px solid #e5e7eb",
    borderRadius: "14px", fontSize: "14px", outline: "none",
    transition: "border-color 0.2s",
    background: "#f9fafb",
  };

  return (
    <div style={{ minHeight: "100vh", background: "white", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ paddingTop: "48px", paddingBottom: "24px", textAlign: "center" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "18px",
          background: "linear-gradient(135deg, #f59e0b, #ea580c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <span style={{ fontSize: "32px", fontWeight: 900, color: "white" }}>L</span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#f59e0b" }}>Loman</h1>
        <p style={{ color: "#9ca3af", fontSize: "11px", letterSpacing: "3px", marginTop: "4px" }}>LOCAL MARKET NUSANTARA</p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: "0 24px 32px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1f2937", marginBottom: "24px" }}>
          {isRegister ? "Buat Akun Baru ✨" : "Selamat Datang! 👋"}
        </h2>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
            fontSize: "13px", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px",
          }}>⚠️ {error}</div>
        )}

        {/* Google Button */}
        <button onClick={handleGoogleLogin} disabled={loading} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: "12px", padding: "14px", border: "2px solid #e5e7eb", borderRadius: "14px",
          fontWeight: 600, fontSize: "15px", color: "#374151", background: "white",
          cursor: "pointer", transition: "all 0.2s", opacity: loading ? 0.5 : 1,
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.1 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 15.6 18.8 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.4 0-9.9-3.6-11.3-8.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.7 39.5 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/></svg>
          Masuk dengan Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
          <span style={{ color: "#9ca3af", fontSize: "13px" }}>atau pakai email</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {isRegister && (
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", marginBottom: "6px", display: "block" }}>Nama Lengkap</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)}
                  placeholder="Masukkan nama Anda" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#f59e0b"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
              </div>
            )}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", marginBottom: "6px", display: "block" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="contoh@email.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#f59e0b"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", marginBottom: "6px", display: "block" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} placeholder="Minimal 6 karakter" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#f59e0b"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: "14px", border: "none",
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              color: "white", fontWeight: 700, fontSize: "16px", cursor: "pointer",
              opacity: loading ? 0.5 : 1, transition: "opacity 0.2s",
              marginTop: "4px",
            }}>
              {loading ? "Memproses..." : isRegister ? "Daftar Sekarang 🚀" : "Masuk →"}
            </button>
          </div>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>
          {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
          <button onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{ fontWeight: 700, color: "#f59e0b", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
            {isRegister ? "Masuk" : "Daftar Gratis"}
          </button>
        </p>
      </div>
    </div>
  );
}
