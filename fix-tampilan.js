// ============================================
// 🎨 LOMAN - Fix Tampilan & Polish UI
// ============================================
// Jalankan: node fix-tampilan.js
// ============================================

const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trimStart());
  console.log("  ✅ " + filePath);
}

console.log("");
console.log("🎨 Memperbaiki tampilan Loman...");
console.log("");

// =============================================
// 1. Hapus file lama yang bentrok (jika masih ada)
// =============================================
const oldFiles = ["app/page.tsx", "app/layout.tsx", "app/page.module.css"];
oldFiles.forEach(f => {
  if (fs.existsSync(f)) { fs.unlinkSync(f); console.log("  🗑️  Hapus " + f); }
});

// =============================================
// 2. Fix globals.css — Tailwind + Custom Styles
// =============================================
writeFile("app/globals.css", `
@import "tailwindcss";

:root {
  --primary: #f59e0b;
  --primary-dark: #d97706;
  --primary-light: #fef3c7;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #1f2937;
  background: #f9fafb;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar hidden */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Animations */
.page-transition {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s infinite;
  border-radius: 8px;
}

@keyframes skeletonLoading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Line clamp */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

/* Desktop frame */
@media (min-width: 481px) {
  body {
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    box-shadow: 0 0 40px rgba(0,0,0,0.08);
  }
}
`);

// =============================================
// 3. Fix layout.js
// =============================================
writeFile("app/layout.js", `
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata = {
  title: "Loman - Local Market Nusantara",
  description: "Belanja Setetangga — Marketplace UMKM Perumahan",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f59e0b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
`);

// =============================================
// 4. Fix Splash Page — lebih cantik
// =============================================
writeFile("app/page.js", `
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";

export default function SplashPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  useEffect(() => {
    if (!loading && user && userData && userData.role) {
      router.push(userData.role === "seller" ? "/seller" : "/buyer");
    }
  }, [user, userData, loading, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute", top: "-50px", right: "-50px",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
      }}></div>
      <div style={{
        position: "absolute", bottom: "-80px", left: "-60px",
        width: "250px", height: "250px", borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
      }}></div>

      {/* Logo */}
      <div style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
        transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}>
        <div style={{
          width: "110px", height: "110px",
          background: "white",
          borderRadius: "28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          marginLeft: "auto", marginRight: "auto",
        }}>
          <span style={{ fontSize: "56px", fontWeight: 900, color: "#f59e0b" }}>L</span>
        </div>
      </div>

      {/* Text */}
      <div style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease 0.2s",
        textAlign: "center",
      }}>
        <h1 style={{
          fontSize: "42px", fontWeight: 900, color: "white",
          letterSpacing: "-1px", marginBottom: "4px",
        }}>Loman</h1>
        <p style={{
          color: "rgba(255,255,255,0.7)", fontSize: "12px",
          letterSpacing: "4px", textTransform: "uppercase",
          marginBottom: "16px",
        }}>Local Market Nusantara</p>
        <p style={{
          color: "rgba(255,255,255,0.9)", fontSize: "16px",
        }}>Belanja Setetangga 🏘️</p>
      </div>

      {/* Button */}
      <div style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.6s ease 0.4s",
      }}>
        <button
          onClick={() => router.push("/login")}
          style={{
            marginTop: "40px",
            background: "white",
            color: "#ea580c",
            fontWeight: 700,
            fontSize: "18px",
            padding: "16px 48px",
            borderRadius: "50px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          Mulai Sekarang
        </button>
      </div>

      {/* Footer */}
      <div style={{
        opacity: show ? 1 : 0,
        transition: "all 0.6s ease 0.6s",
        marginTop: "32px",
        textAlign: "center",
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: 1.6 }}>
          Marketplace untuk warga perumahan<br/>
          Pesan makanan, kue, laundry dari tetangga
        </p>
        <div style={{
          display: "flex", gap: "8px", justifyContent: "center",
          marginTop: "16px",
        }}>
          {["🍚", "🧁", "🥤", "👕", "🧴"].map((e, i) => (
            <span key={i} style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

// =============================================
// 5. Fix Login Page — lebih cantik
// =============================================
writeFile("app/login/page.js", `
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
`);

// =============================================
// 6. Fix Pilih Role Page
// =============================================
writeFile("app/pilih-role/page.js", `
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

export default function PilihRolePage() {
  const router = useRouter();
  const { user, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  async function selectRole(role) {
    if (!user) { router.push("/login"); return; }
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { role });
      setUserData(prev => ({ ...prev, role }));
      router.push(role === "seller" ? "/seller" : "/buyer");
    } catch (err) { console.error(err); alert("Gagal. Coba lagi."); }
    setLoading(false);
  }

  const cardStyle = (hoverColor) => ({
    width: "100%", display: "flex", alignItems: "center", gap: "16px",
    padding: "20px", background: "white", border: "2px solid #e5e7eb",
    borderRadius: "18px", textAlign: "left", cursor: "pointer",
    transition: "all 0.2s", opacity: loading ? 0.5 : 1,
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: "#f9fafb",
    }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "56px", marginBottom: "12px" }}>👋</div>
        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937" }}>Selamat Datang!</h1>
        <p style={{ color: "#6b7280", marginTop: "8px", fontSize: "15px" }}>Anda ingin menggunakan Loman sebagai?</p>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
        <button onClick={() => selectRole("buyer")} disabled={loading} style={cardStyle()}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#eff6ff"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "white"; }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "18px", background: "#dbeafe",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0,
          }}>🛒</div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>Pembeli</h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Cari & pesan produk dari tetangga perumahan</p>
          </div>
        </button>

        <button onClick={() => selectRole("seller")} disabled={loading} style={cardStyle()}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.background = "#fffbeb"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "white"; }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "18px", background: "#fef3c7",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0,
          }}>🏪</div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>Penjual</h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Jual produk Anda ke warga perumahan</p>
          </div>
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "32px", textAlign: "center" }}>
        💡 Anda bisa mengubah role ini nanti di pengaturan profil
      </p>
    </div>
  );
}
`);

// =============================================
// 7. Cek & fix tailwind config
// =============================================

// Cek apakah ada tailwind.config.js atau tailwind.config.ts
const twConfigs = ["tailwind.config.js", "tailwind.config.ts", "tailwind.config.mjs"];
let twFound = false;
twConfigs.forEach(f => { if (fs.existsSync(f)) twFound = true; });

if (twFound) {
  console.log("  ℹ️  Tailwind config ditemukan");
} else {
  console.log("  ℹ️  Tailwind config tidak ditemukan (Next.js 16 mungkin pakai built-in)");
}

// Cek postcss.config
if (!fs.existsSync("postcss.config.mjs") && !fs.existsSync("postcss.config.js")) {
  writeFile("postcss.config.mjs", `
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`);
}

console.log("");
console.log("🎉 ========================================");
console.log("   TAMPILAN DIPERBAIKI!");
console.log("========================================");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Buka: http://localhost:3000");
console.log("");
console.log("   Seharusnya sekarang tampil CANTIK! 🔥");
console.log("");
