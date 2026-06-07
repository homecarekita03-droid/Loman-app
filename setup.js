// ============================================
// 🚀 LOMAN AUTO SETUP - Local Market Nusantara
// ============================================
// 
// CARA PAKAI:
// 1. Copy file ini ke folder project Next.js Anda
//    (folder yang ada package.json)
// 2. Buka Terminal, jalankan: node setup.js
// 3. Lalu jalankan: npm run dev
// 4. Buka http://localhost:3000
// 5. SELESAI! 🎉
//
// ============================================

const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content.trimStart());
  console.log("  ✅ " + filePath);
}

console.log("");
console.log("🚀 ========================================");
console.log("   LOMAN - Local Market Nusantara");
console.log("   Auto Setup v1.0");
console.log("========================================");
console.log("");
console.log("📁 Membuat semua file...");
console.log("");

// =============================================
// jsconfig.json
// =============================================
writeFile("jsconfig.json", `
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
`);

// =============================================
// public/manifest.json (PWA)
// =============================================
writeFile("public/manifest.json", `
{
  "name": "Loman - Local Market Nusantara",
  "short_name": "Loman",
  "description": "Belanja Setetangga",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f59e0b",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
`);

// =============================================
// lib/firebase.js
// =============================================
writeFile("lib/firebase.js", `
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCr7BbmYQ42EtxkTJ9zP0iGtRsvxOVlIo8",
  authDomain: "loman-app.firebaseapp.com",
  projectId: "loman-app",
  storageBucket: "loman-app.firebasestorage.app",
  messagingSenderId: "642027415706",
  appId: "1:642027415706:web:0c0f7f49133183ab405723",
  measurementId: "G-F2LYE5Q6P0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
`);

// =============================================
// lib/AuthContext.js
// =============================================
writeFile("lib/AuthContext.js", `
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        try {
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          setUserData(snap.exists() ? snap.data() : null);
        } catch (e) {
          console.error(e);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, setUserData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
`);

// =============================================
// components/BottomNav.js
// =============================================
writeFile("components/BottomNav.js", `
"use client";
import { useRouter } from "next/navigation";

export default function BottomNav({ role, active }) {
  const router = useRouter();

  const buyerMenu = [
    { id: "home", icon: "🏠", label: "Beranda", path: "/buyer" },
    { id: "cart", icon: "🛒", label: "Keranjang", path: "/buyer/keranjang" },
    { id: "orders", icon: "📋", label: "Pesanan", path: "/buyer/pesanan" },
    { id: "profile", icon: "👤", label: "Profil", path: "/buyer/profil" },
  ];

  const sellerMenu = [
    { id: "home", icon: "📊", label: "Dashboard", path: "/seller" },
    { id: "products", icon: "📦", label: "Produk", path: "/seller/produk" },
    { id: "orders", icon: "📋", label: "Pesanan", path: "/seller/pesanan" },
    { id: "profile", icon: "👤", label: "Profil", path: "/seller/profil" },
  ];

  const menu = role === "seller" ? sellerMenu : buyerMenu;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 flex justify-around py-2 pb-3 z-50">
      {menu.map((item) => (
        <button key={item.id} onClick={() => router.push(item.path)}
          className="flex flex-col items-center gap-0.5 px-3 py-1">
          <span className="text-xl">{item.icon}</span>
          <span className={"text-xs " + (active === item.id ? "font-bold text-amber-600" : "text-gray-400")}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
`);

// =============================================
// app/globals.css
// =============================================
writeFile("app/globals.css", `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #f59e0b;
  --primary-dark: #d97706;
  --primary-light: #fef3c7;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
  background: #f9fafb;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.page-transition { animation: fadeIn 0.3s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skl 1.5s infinite;
  border-radius: 8px;
}
@keyframes skl {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (min-width: 481px) {
  body { border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; box-shadow: 0 0 40px rgba(0,0,0,0.08); }
}
`);

// =============================================
// app/layout.js
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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
`);

// =============================================
// app/page.js — Splash Screen
// =============================================
writeFile("app/page.js", `
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";

export default function SplashPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && userData && userData.role) {
      router.push(userData.role === "seller" ? "/seller" : "/buyer");
    }
  }, [user, userData, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)" }}>
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6"
           style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
        <span className="text-5xl font-black" style={{ color: "#f59e0b" }}>L</span>
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">Loman</h1>
      <p className="text-white/80 text-sm mt-1" style={{ letterSpacing: "3px" }}>LOCAL MARKET NUSANTARA</p>
      <p className="text-white/90 text-base mt-3">Belanja Setetangga 🏘️</p>
      <button onClick={() => router.push("/login")}
        className="mt-10 bg-white text-amber-600 font-bold text-lg px-12 py-4 rounded-full hover:scale-105 transition-transform"
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
        Mulai Sekarang
      </button>
      <p className="text-white/50 text-xs mt-6 text-center">Marketplace UMKM Perumahan<br/>Pesan makanan, kue, laundry dari tetangga</p>
    </div>
  );
}
`);

// =============================================
// app/login/page.js
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

  return (
    <div className="min-h-screen bg-white flex flex-col page-transition">
      <div className="pt-12 pb-8 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}>
          <span className="text-3xl font-black text-white">L</span>
        </div>
        <h1 className="text-2xl font-black" style={{ color: "#f59e0b" }}>Loman</h1>
        <p className="text-gray-400 text-xs mt-1" style={{ letterSpacing: "2px" }}>LOCAL MARKET NUSANTARA</p>
      </div>
      <div className="flex-1 px-6 pb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{isRegister ? "Buat Akun Baru" : "Masuk ke Akun"}</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">⚠️ {error}</div>}
        <button onClick={handleGoogleLogin} disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          🔵 Masuk dengan Google
        </button>
        <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-gray-200"></div><span className="text-gray-400 text-sm">atau</span><div className="flex-1 h-px bg-gray-200"></div></div>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegister && <div><label className="text-sm font-medium text-gray-600 mb-1 block">Nama</label><input type="text" value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama lengkap" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" /></div>}
          <div><label className="text-sm font-medium text-gray-600 mb-1 block">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="contoh@email.com" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" /></div>
          <div><label className="text-sm font-medium text-gray-600 mb-1 block">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 karakter" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" /></div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}>{loading ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">{isRegister ? "Sudah punya akun? " : "Belum punya akun? "}<button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="font-bold" style={{ color: "#f59e0b" }}>{isRegister ? "Masuk" : "Daftar"}</button></p>
      </div>
    </div>
  );
}
`);

// =============================================
// app/pilih-role/page.js
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white page-transition">
      <div className="text-5xl mb-4">👋</div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">Selamat Datang!</h1>
      <p className="text-gray-500 mb-8">Anda ingin menggunakan Loman sebagai?</p>
      <div className="w-full space-y-4">
        <button onClick={() => selectRole("buyer")} disabled={loading} className="w-full flex items-center gap-4 p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-amber-400 hover:bg-amber-50 transition-all disabled:opacity-50">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">🛒</div>
          <div><h3 className="text-lg font-bold">Pembeli</h3><p className="text-sm text-gray-500">Cari & pesan produk dari tetangga</p></div>
        </button>
        <button onClick={() => selectRole("seller")} disabled={loading} className="w-full flex items-center gap-4 p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-amber-400 hover:bg-amber-50 transition-all disabled:opacity-50">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl">🏪</div>
          <div><h3 className="text-lg font-bold">Penjual</h3><p className="text-sm text-gray-500">Jual produk ke warga perumahan</p></div>
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-8">💡 Bisa diubah nanti di pengaturan</p>
    </div>
  );
}
`);

// =============================================
// app/buyer/page.js — Buyer Home
// =============================================
writeFile("app/buyer/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

const categories = [
  { id: "all", emoji: "🍽️", name: "Semua" },
  { id: "makanan", emoji: "🍚", name: "Makanan" },
  { id: "kue", emoji: "🧁", name: "Kue" },
  { id: "minuman", emoji: "🥤", name: "Minuman" },
  { id: "laundry", emoji: "👕", name: "Laundry" },
  { id: "kebutuhan", emoji: "🧴", name: "Kebutuhan" },
];

export default function BuyerHome() {
  const router = useRouter();
  const { user, userData, loading: al } = useAuth();
  const [stores, setStores] = useState([]);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!al && !user) router.push("/login"); }, [user, al, router]);
  useEffect(() => {
    async function f() {
      try { const s = await getDocs(collection(db, "toko")); setStores(s.docs.map(d => ({ id: d.id, ...d.data() }))); } catch(e) { console.error(e); }
      setLoading(false);
    }
    if (user) f();
  }, [user]);

  const filtered = stores.filter(s => {
    const cm = cat === "all" || s.kategori?.toLowerCase() === cat;
    const sm = !search.trim() || s.nama?.toLowerCase().includes(search.toLowerCase());
    return cm && sm;
  });

  const bc = { makanan: "from-red-100 to-orange-100", kue: "from-yellow-100 to-amber-100", minuman: "from-blue-100 to-cyan-100", laundry: "from-green-100 to-emerald-100" };
  const se = { makanan: "🍳", kue: "🧁", minuman: "🥤", laundry: "👕", kebutuhan: "🧴" };

  if (al) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">🏪</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">📍 <span className="font-semibold text-gray-600">{userData?.perumahan || "Pilih Perumahan"}</span></p>
            <h1 className="text-2xl font-black mt-1" style={{ color: "#f59e0b" }}>Loman</h1>
          </div>
          <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-lg">🔔</div>
        </div>
        <div className="px-5 pb-3"><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" placeholder="Cari makanan, minuman..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white" /></div></div>
      </div>

      <div className="px-5 py-4"><div className="flex gap-3 overflow-x-auto no-scrollbar">
        {categories.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className={"w-14 h-14 rounded-2xl flex items-center justify-center text-2xl " + (cat === c.id ? "bg-amber-100 ring-2 ring-amber-400" : "bg-gray-100")}>{c.emoji}</div>
            <span className={"text-xs " + (cat === c.id ? "font-bold text-amber-600" : "text-gray-500")}>{c.name}</span>
          </button>
        ))}
      </div></div>

      <div className="px-5 mb-4"><div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}>
        <h3 className="text-lg font-bold text-white">🎉 Gratis Ongkir!</h3>
        <p className="text-white/80 text-sm mt-1">Pesanan di atas Rp 20.000</p>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-30">🛵</span>
      </div></div>

      <div className="px-5">
        <h3 className="text-base font-bold text-gray-800 mb-3">Toko ({filtered.length})</h3>
        {loading ? [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl overflow-hidden mb-3"><div className="h-32 skeleton"></div><div className="p-4"><div className="h-4 w-3/4 skeleton mb-2"></div><div className="h-3 w-1/2 skeleton"></div></div></div>)
        : filtered.length === 0 ? <div className="text-center py-16"><div className="text-5xl mb-3">🏪</div><h3 className="text-lg font-bold text-gray-700">Belum Ada Toko</h3><p className="text-sm text-gray-400 mt-1">Belum ada toko terdaftar</p></div>
        : <div className="space-y-3">{filtered.map(s => (
          <div key={s.id} onClick={() => router.push("/buyer/toko/" + s.id)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer">
            <div className={"h-32 flex items-center justify-center text-5xl relative bg-gradient-to-r " + (bc[s.kategori?.toLowerCase()] || "from-gray-100 to-gray-200")}>
              {se[s.kategori?.toLowerCase()] || s.emoji || "🏪"}
              <span className={"absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold " + (s.isOpen !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{s.isOpen !== false ? "● Buka" : "● Tutup"}</span>
            </div>
            <div className="p-4"><h4 className="text-base font-bold text-gray-800">{s.nama}</h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500"><span className="text-amber-500 font-semibold">⭐ {s.rating || "Baru"}</span><span>📍 {s.alamat || "-"}</span></div>
              {s.deskripsi && <p className="text-sm text-gray-400 mt-2">{s.deskripsi}</p>}</div>
          </div>))}</div>}
      </div>
      <BottomNav role="buyer" active="home" />
    </div>
  );
}
`);

// =============================================
// app/buyer/toko/[id]/page.js — Store Detail
// =============================================
writeFile("app/buyer/toko/[id]/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

export default function StoreDetail() {
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { try { const c = JSON.parse(localStorage.getItem("loman_cart") || "[]"); setCart(c); } catch(e){} }, []);
  useEffect(() => { localStorage.setItem("loman_cart", JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    async function f() {
      try {
        const sd = await getDoc(doc(db, "toko", params.id));
        if (sd.exists()) setStore({ id: sd.id, ...sd.data() });
        const ps = await getDocs(query(collection(db, "produk"), where("tokoId", "==", params.id)));
        setProducts(ps.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.tersedia !== false));
      } catch(e) { console.error(e); }
      setLoading(false);
    }
    if (params.id) f();
  }, [params.id]);

  function addToCart(p) {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, nama: p.nama, harga: p.harga, emoji: p.emoji || "📦", tokoId: params.id, tokoNama: store?.nama || "", qty: 1 }];
    });
  }

  const cartTotal = cart.reduce((s, i) => s + i.qty, 0);
  const bgs = ["bg-amber-50","bg-blue-50","bg-green-50","bg-pink-50","bg-purple-50"];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">🏪</div></div>;
  if (!store) return <div className="min-h-screen flex flex-col items-center justify-center px-6"><div className="text-5xl mb-4">😕</div><h2 className="text-xl font-bold">Toko Tidak Ditemukan</h2><button onClick={() => router.push("/buyer")} className="mt-4 text-amber-600 font-semibold">← Kembali</button></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="relative">
        <button onClick={() => router.push("/buyer")} className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md text-lg">←</button>
        <div className="h-44 bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center text-7xl">{store.emoji || "🏪"}</div>
      </div>
      <div className="bg-white px-5 py-4 border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-800">{store.nama}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500"><span className="text-amber-500 font-semibold">⭐ {store.rating || "Baru"}</span><span>📍 {store.alamat || "-"}</span></div>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500"><span>🕐 {store.jamBuka||"08:00"} - {store.jamTutup||"20:00"}</span><span className={store.isOpen !== false ? "text-green-500 font-semibold" : "text-red-500"}>{store.isOpen !== false ? "● Buka" : "● Tutup"}</span></div>
        {store.deskripsi && <p className="text-sm text-gray-400 mt-2">{store.deskripsi}</p>}
      </div>
      <div className="px-5 py-4">
        <h3 className="text-base font-bold text-gray-800 mb-3">Menu ({products.length})</h3>
        {products.length === 0 ? <div className="text-center py-12"><div className="text-4xl mb-2">📦</div><p className="text-gray-400">Belum ada produk</p></div>
        : <div className="grid grid-cols-2 gap-3">{products.map((p, i) => {
          const ic = cart.find(c => c.id === p.id);
          return (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className={"h-28 flex items-center justify-center text-4xl " + bgs[i % bgs.length]}>{p.emoji || "📦"}</div>
              <div className="p-3">
                <h4 className="text-sm font-semibold text-gray-800">{p.nama}</h4>
                <p className="text-base font-bold mt-1" style={{ color: "#f59e0b" }}>Rp {(p.harga||0).toLocaleString("id")}</p>
                <button onClick={() => addToCart(p)} className={"w-full mt-2 py-2 rounded-lg text-sm font-semibold " + (ic ? "bg-green-500 text-white" : "bg-amber-500 text-white hover:bg-amber-600")}>
                  {ic ? "✓ " + ic.qty + " di keranjang" : "+ Keranjang"}</button>
              </div>
            </div>);
        })}</div>}
      </div>
      {cartTotal > 0 && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-5 z-50">
        <button onClick={() => router.push("/buyer/keranjang")} className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-between px-6 shadow-lg" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}>
          <span>🛒 {cartTotal} item</span><span>Lihat →</span></button></div>}
      <BottomNav role="buyer" active="home" />
    </div>
  );
}
`);

// =============================================
// app/buyer/keranjang/page.js
// =============================================
writeFile("app/buyer/keranjang/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

export default function KeranjangPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [cart, setCart] = useState([]);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem("loman_cart")||"[]")); } catch(e){} }, []);
  useEffect(() => { localStorage.setItem("loman_cart", JSON.stringify(cart)); }, [cart]);

  function changeQty(id, d) { setCart(prev => prev.map(i => i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0)); }
  const total = cart.reduce((s,i) => s+i.harga*i.qty, 0);

  async function checkout() {
    if (!user || !cart.length) return;
    setLoading(true);
    try {
      const groups = {};
      cart.forEach(i => { if(!groups[i.tokoId]) groups[i.tokoId]={tokoId:i.tokoId,tokoNama:i.tokoNama,items:[]}; groups[i.tokoId].items.push(i); });
      for (const g of Object.values(groups)) {
        const sub = g.items.reduce((s,i)=>s+i.harga*i.qty,0);
        await addDoc(collection(db,"pesanan"),{
          pembeliId:user.uid, pembeliNama:userData?.nama||"User", pembeliAlamat:userData?.alamat||"", pembeliPhone:userData?.phone||"",
          tokoId:g.tokoId, tokoNama:g.tokoNama, items:g.items.map(i=>({produkId:i.id,nama:i.nama,harga:i.harga,qty:i.qty,subtotal:i.harga*i.qty})),
          totalHarga:sub, status:"pending", catatan, metodeBayar:"cash", createdAt:new Date().toISOString(),
        });
      }
      setCart([]); localStorage.removeItem("loman_cart"); setSuccess(true);
    } catch(e) { console.error(e); alert("Gagal. Coba lagi."); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4"><h1 className="text-xl font-black text-gray-800">🛒 Keranjang</h1></div>
      {cart.length===0 && !success ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🛒</div><h3 className="text-lg font-bold text-gray-700">Keranjang Kosong</h3>
          <button onClick={()=>router.push("/buyer")} className="mt-6 px-6 py-3 rounded-xl font-semibold text-white" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>Mulai Belanja</button>
        </div>
      ) : success ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="text-6xl mb-4">🎉</div><h3 className="text-xl font-bold">Pesanan Berhasil!</h3>
          <p className="text-sm text-gray-500 mt-2 text-center">Pesanan dikirim ke penjual.</p>
          <button onClick={()=>router.push("/buyer/pesanan")} className="mt-6 px-8 py-3 rounded-xl font-bold text-white" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>Lihat Pesanan</button>
        </div>
      ) : (<>
        <div className="px-5 py-4 space-y-3">
          {cart.map(i => (
            <div key={i.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">{i.emoji}</div>
              <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold truncate">{i.nama}</h4><p className="text-sm font-bold" style={{color:"#f59e0b"}}>Rp {i.harga.toLocaleString("id")}</p></div>
              <div className="flex items-center gap-2"><button onClick={()=>changeQty(i.id,-1)} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center">−</button><span className="font-bold w-6 text-center">{i.qty}</span><button onClick={()=>changeQty(i.id,1)} className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center">+</button></div>
            </div>
          ))}
          <div className="bg-white rounded-2xl p-4 shadow-sm"><label className="text-sm font-semibold text-gray-700 mb-2 block">📝 Catatan</label>
            <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Tidak pakai pedas, extra sambal..." rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none" /></div>
        </div>
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t px-5 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
          <div className="flex justify-between items-center mb-3"><span className="text-gray-500 text-sm">Total</span><span className="text-xl font-black">Rp {total.toLocaleString("id")}</span></div>
          <button onClick={checkout} disabled={loading} className="w-full py-3.5 rounded-xl text-white font-bold disabled:opacity-50" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>{loading?"Memproses...":"Pesan Sekarang 🛵"}</button>
        </div>
      </>)}
      <BottomNav role="buyer" active="cart" />
    </div>
  );
}
`);

// =============================================
// app/buyer/pesanan/page.js
// =============================================
writeFile("app/buyer/pesanan/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

const sc = { pending:{l:"⏳ Menunggu",c:"bg-gray-100 text-gray-600"}, confirmed:{l:"✅ Diterima",c:"bg-blue-50 text-blue-600"}, cooking:{l:"🍳 Dimasak",c:"bg-amber-50 text-amber-700"}, delivering:{l:"🛵 Diantar",c:"bg-purple-50 text-purple-600"}, done:{l:"✅ Selesai",c:"bg-green-50 text-green-600"}, cancelled:{l:"❌ Batal",c:"bg-red-50 text-red-600"} };

export default function PesananBuyer() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!al && !user) router.push("/login"); }, [user, al, router]);
  useEffect(() => {
    async function f() {
      if (!user) return;
      try { const s = await getDocs(query(collection(db,"pesanan"),where("pembeliId","==",user.uid))); setOrders(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  function ft(iso) { if(!iso)return""; const d=new Date(iso),n=new Date(),m=Math.floor((n-d)/60000); if(m<1)return"Baru saja"; if(m<60)return m+" menit lalu"; if(m<1440)return Math.floor(m/60)+" jam lalu"; return d.toLocaleDateString("id",{day:"numeric",month:"short"}); }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4"><h1 className="text-xl font-black text-gray-800">📋 Pesanan Saya</h1></div>
      {loading ? <div className="px-5 py-4 space-y-3">{[1,2,3].map(i=><div key={i} className="bg-white rounded-2xl p-4"><div className="h-4 w-3/4 skeleton mb-2"></div><div className="h-3 w-1/2 skeleton"></div></div>)}</div>
      : orders.length===0 ? <div className="flex flex-col items-center justify-center py-20"><div className="text-6xl mb-4">📋</div><h3 className="text-lg font-bold text-gray-700">Belum Ada Pesanan</h3><button onClick={()=>router.push("/buyer")} className="mt-6 px-6 py-3 rounded-xl font-semibold text-white" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>Mulai Belanja</button></div>
      : <div className="px-5 py-4 space-y-3">{orders.map(o=>{const s=sc[o.status]||sc.pending; return(
        <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2"><div><p className="text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</p><h4 className="text-base font-bold">{o.tokoNama}</h4></div><span className={"px-3 py-1 rounded-full text-xs font-semibold "+s.c}>{s.l}</span></div>
          <p className="text-sm text-gray-500">{o.items?.map(i=>i.nama+" x"+i.qty).join(", ")}</p>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100"><span className="font-bold" style={{color:"#f59e0b"}}>Rp {(o.totalHarga||0).toLocaleString("id")}</span><span className="text-xs text-gray-400">{ft(o.createdAt)}</span></div>
        </div>);})}</div>}
      <BottomNav role="buyer" active="orders" />
    </div>
  );
}
`);

// =============================================
// app/buyer/profil/page.js
// =============================================
writeFile("app/buyer/profil/page.js", `
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

export default function ProfilPage() {
  const router = useRouter();
  const { user, userData, setUserData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nama: userData?.nama||"", phone: userData?.phone||"", alamat: userData?.alamat||"", perumahan: userData?.perumahan||"" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if(!user)return; setSaving(true);
    try { await updateDoc(doc(db,"users",user.uid),form); setUserData(p=>({...p,...form})); setEditing(false); } catch(e){alert("Gagal.");}
    setSaving(false);
  }
  async function logout() { if(confirm("Yakin keluar?")) { await signOut(auth); router.push("/"); } }
  async function switchRole() {
    if(!user)return; const nr = userData?.role==="seller"?"buyer":"seller";
    try { await updateDoc(doc(db,"users",user.uid),{role:nr}); setUserData(p=>({...p,role:nr})); router.push(nr==="seller"?"/seller":"/buyer"); } catch(e){console.error(e);}
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4"><h1 className="text-xl font-black text-gray-800">👤 Profil</h1></div>
      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center mb-4">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl" style={{background:"linear-gradient(135deg,#fef3c7,#fde68a)"}}>
            {user?.photoURL ? <img src={user.photoURL} alt="" className="w-20 h-20 rounded-full object-cover" /> : "👤"}
          </div>
          <h2 className="text-lg font-bold">{userData?.nama||"User"}</h2>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">{userData?.role==="seller"?"🏪 Penjual":"🛒 Pembeli"}</span>
        </div>
        {editing ? (<div className="space-y-3">
          {[{l:"Nama",k:"nama",p:"Nama lengkap"},{l:"No. HP",k:"phone",p:"08xxx"},{l:"Alamat",k:"alamat",p:"Blok A No.15"},{l:"Perumahan",k:"perumahan",p:"Griya Indah"}].map(f=>(
            <div key={f.k} className="bg-white rounded-2xl p-4 shadow-sm"><label className="text-xs text-gray-400 mb-1 block">{f.l}</label>
              <input value={form[f.k]} onChange={e=>setForm(prev=>({...prev,[f.k]:e.target.value}))} placeholder={f.p} className="w-full text-sm font-semibold border-b border-gray-200 pb-1 focus:outline-none focus:border-amber-400" /></div>))}
          <div className="flex gap-3 pt-2"><button onClick={()=>setEditing(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold">Batal</button>
            <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-50" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>{saving?"Menyimpan...":"💾 Simpan"}</button></div>
        </div>) : (<div className="space-y-3">
          {[{l:"Nama",v:userData?.nama,i:"👤"},{l:"No. HP",v:userData?.phone||"Belum diisi",i:"📱"},{l:"Alamat",v:userData?.alamat||"Belum diisi",i:"🏠"},{l:"Perumahan",v:userData?.perumahan||"Belum diisi",i:"📍"}].map(f=>(
            <div key={f.l} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"><span className="text-xl">{f.i}</span><div><p className="text-xs text-gray-400">{f.l}</p><p className="text-sm font-semibold">{f.v}</p></div></div>))}
          <button onClick={()=>setEditing(true)} className="w-full py-3 rounded-xl border-2 border-amber-400 text-amber-600 font-semibold mt-2">✏️ Edit Profil</button>
        </div>)}
        <div className="pt-4 space-y-3">
          <button onClick={switchRole} className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm">🔄 Ganti ke {userData?.role==="seller"?"Pembeli":"Penjual"}</button>
          <button onClick={logout} className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-semibold">🚪 Keluar</button>
        </div>
      </div>
      <BottomNav role={userData?.role||"buyer"} active="profile" />
    </div>
  );
}
`);

// =============================================
// app/seller/page.js — Seller Dashboard
// =============================================
writeFile("app/seller/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, userData, loading: al } = useAuth();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ today: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!al && !user) router.push("/login"); }, [user, al, router]);

  useEffect(() => {
    async function f() {
      if (!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        let sid;
        if (sq.empty) {
          const nr = doc(collection(db,"toko"));
          const ns = { nama:"Toko "+(userData?.nama||"Saya"), pemilikId:user.uid, kategori:"makanan", deskripsi:"", alamat:userData?.alamat||"", jamBuka:"08:00", jamTutup:"20:00", emoji:"🏪", rating:0, isOpen:true, createdAt:new Date().toISOString() };
          await setDoc(nr, ns); setStore({id:nr.id,...ns}); sid=nr.id;
        } else { setStore({id:sq.docs[0].id,...sq.docs[0].data()}); sid=sq.docs[0].id; }
        const os = await getDocs(query(collection(db,"pesanan"),where("tokoId","==",sid)));
        const ol = os.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
        setOrders(ol);
        const td = new Date().toDateString();
        const to = ol.filter(o=>new Date(o.createdAt).toDateString()===td);
        setStats({ today:to.length, revenue:to.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+(o.totalHarga||0),0) });
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user, userData]);

  async function toggleStore() { if(!store)return; const n=!store.isOpen; await updateDoc(doc(db,"toko",store.id),{isOpen:n}); setStore(p=>({...p,isOpen:n})); }
  async function updateStatus(id, s) { await updateDoc(doc(db,"pesanan",id),{status:s}); setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o)); }

  const pending = orders.filter(o=>o.status==="pending");
  const active = orders.filter(o=>["confirmed","cooking","delivering"].includes(o.status));
  const ns = {confirmed:"cooking",cooking:"delivering",delivering:"done"};
  const nl = {confirmed:"Mulai Masak 🍳",cooking:"Kirim 🛵",delivering:"Selesai ✅"};

  if (al||loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">🏪</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div><p className="text-xs text-gray-400">🏪 {store?.nama}</p><h1 className="text-xl font-black">Dashboard</h1></div>
        <button onClick={toggleStore} className="flex items-center gap-2">
          <div className={"w-12 h-7 rounded-full relative transition-colors "+(store?.isOpen?"bg-green-500":"bg-gray-300")}><div className={"w-5 h-5 rounded-full bg-white absolute top-1 shadow transition-transform "+(store?.isOpen?"translate-x-6":"translate-x-1")}></div></div>
          <span className={"text-sm font-semibold "+(store?.isOpen?"text-green-500":"text-gray-400")}>{store?.isOpen?"● Buka":"● Tutup"}</span>
        </button>
      </div>
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="text-2xl mb-1">📦</div><div className="text-2xl font-black">{stats.today}</div><div className="text-xs text-gray-400">Pesanan Hari Ini</div></div>
        <div className="bg-white rounded-2xl p-4 shadow-sm"><div className="text-2xl mb-1">💰</div><div className="text-xl font-black" style={{color:"#f59e0b"}}>Rp {stats.revenue>=1000?Math.round(stats.revenue/1000)+"K":stats.revenue}</div><div className="text-xs text-gray-400">Pendapatan</div></div>
      </div>
      {pending.length>0 && <div className="px-5 mb-4"><h3 className="text-base font-bold mb-3">🔔 Pesanan Masuk ({pending.length})</h3><div className="space-y-3">
        {pending.map(o=>(
          <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-amber-400">
            <div className="flex justify-between items-center mb-2"><h4 className="font-bold">👤 {o.pembeliNama}</h4><span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleTimeString("id",{hour:"2-digit",minute:"2-digit"})}</span></div>
            <div className="text-sm text-gray-600 mb-2">{o.items?.map(i=>"• "+i.nama+" x"+i.qty).join("\\n")}</div>
            {o.catatan&&<p className="text-xs text-gray-400 mb-2">📝 {o.catatan}</p>}
            <div className="text-lg font-bold mb-3" style={{color:"#f59e0b"}}>Rp {(o.totalHarga||0).toLocaleString("id")}</div>
            <div className="flex gap-2"><button onClick={()=>updateStatus(o.id,"cancelled")} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">✗ Tolak</button>
              <button onClick={()=>updateStatus(o.id,"confirmed")} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm">✓ Terima</button></div>
          </div>))}</div></div>}
      {active.length>0 && <div className="px-5 mb-4"><h3 className="text-base font-bold mb-3">🍳 Aktif ({active.length})</h3><div className="space-y-3">
        {active.map(o=>(
          <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2"><h4 className="font-semibold text-sm">👤 {o.pembeliNama}</h4><span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold">{o.status==="confirmed"?"✅ Diterima":o.status==="cooking"?"🍳 Dimasak":"🛵 Diantar"}</span></div>
            <p className="text-sm text-gray-500 mb-3">{o.items?.map(i=>i.nama+" x"+i.qty).join(", ")}</p>
            {ns[o.status]&&<button onClick={()=>updateStatus(o.id,ns[o.status])} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>{nl[o.status]}</button>}
          </div>))}</div></div>}
      {!pending.length&&!active.length&&<div className="text-center py-12"><div className="text-5xl mb-3">📭</div><h3 className="text-lg font-bold text-gray-700">Belum Ada Pesanan</h3></div>}
      <BottomNav role="seller" active="home" />
    </div>
  );
}
`);

// =============================================
// app/seller/produk/page.js
// =============================================
writeFile("app/seller/produk/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

const emojis = ["🍚","🍜","🍗","🥘","🧁","🍰","🥤","☕","🧃","👕","🧴","📦","🌿","🍳","🥗","🍲"];

export default function KelolaProduk() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [storeId, setStoreId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama:"", harga:"", deskripsi:"", emoji:"🍚", kategori:"makanan" });

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        if(!sq.empty) { const sid=sq.docs[0].id; setStoreId(sid);
          const pq = await getDocs(query(collection(db,"produk"),where("tokoId","==",sid)));
          setProducts(pq.docs.map(d=>({id:d.id,...d.data()}))); }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  async function submit(e) {
    e.preventDefault(); if(!storeId||!form.nama.trim()||!form.harga) return;
    const d = { tokoId:storeId, nama:form.nama.trim(), harga:parseInt(form.harga), deskripsi:form.deskripsi, emoji:form.emoji, kategori:form.kategori, tersedia:true };
    try {
      if(editId) { await updateDoc(doc(db,"produk",editId),d); setProducts(p=>p.map(x=>x.id===editId?{...x,...d}:x)); }
      else { const nd = await addDoc(collection(db,"produk"),d); setProducts(p=>[...p,{id:nd.id,...d}]); }
      reset();
    } catch(e){ alert("Gagal simpan."); }
  }

  function reset() { setForm({nama:"",harga:"",deskripsi:"",emoji:"🍚",kategori:"makanan"}); setEditId(null); setShowForm(false); }
  function edit(p) { setForm({nama:p.nama,harga:String(p.harga),deskripsi:p.deskripsi||"",emoji:p.emoji||"🍚",kategori:p.kategori||"makanan"}); setEditId(p.id); setShowForm(true); }
  async function del(id) { if(!confirm("Hapus?")) return; await deleteDoc(doc(db,"produk",id)); setProducts(p=>p.filter(x=>x.id!==id)); }
  async function toggle(id,c) { await updateDoc(doc(db,"produk",id),{tersedia:!c}); setProducts(p=>p.map(x=>x.id===id?{...x,tersedia:!c}:x)); }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black">📦 Produk</h1>
        <button onClick={()=>{reset();setShowForm(true);}} className="px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>+ Tambah</button>
      </div>
      {showForm && <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-white w-full max-w-[480px] rounded-t-3xl p-6" style={{animation:"slideUp 0.3s ease"}}>
          <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{editId?"Edit":"Tambah"} Produk</h3><button onClick={reset} className="text-gray-400 text-xl">✕</button></div>
          <form onSubmit={submit} className="space-y-4">
            <div><label className="text-sm font-medium text-gray-600 mb-2 block">Emoji</label><div className="flex flex-wrap gap-2">{emojis.map(e=><button key={e} type="button" onClick={()=>setForm(f=>({...f,emoji:e}))} className={"w-10 h-10 rounded-xl text-xl flex items-center justify-center "+(form.emoji===e?"bg-amber-100 ring-2 ring-amber-400":"bg-gray-100")}>{e}</button>)}</div></div>
            <div><label className="text-sm font-medium text-gray-600 mb-1 block">Nama</label><input required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} placeholder="Nasi Goreng Spesial" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" /></div>
            <div><label className="text-sm font-medium text-gray-600 mb-1 block">Harga (Rp)</label><input type="number" required value={form.harga} onChange={e=>setForm(f=>({...f,harga:e.target.value}))} placeholder="15000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" /></div>
            <div><label className="text-sm font-medium text-gray-600 mb-1 block">Kategori</label><select value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"><option value="makanan">🍚 Makanan</option><option value="kue">🧁 Kue</option><option value="minuman">🥤 Minuman</option><option value="laundry">👕 Laundry</option><option value="kebutuhan">🧴 Kebutuhan</option><option value="lainnya">📦 Lainnya</option></select></div>
            <div><label className="text-sm font-medium text-gray-600 mb-1 block">Deskripsi</label><textarea value={form.deskripsi} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))} placeholder="Opsional..." rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none" /></div>
            <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>{editId?"💾 Simpan":"✅ Tambah"}</button>
          </form></div></div>}
      <div className="px-5 py-4 space-y-3">
        {loading ? [1,2,3].map(i=><div key={i} className="bg-white rounded-2xl p-4"><div className="h-4 w-3/4 skeleton mb-2"></div><div className="h-3 w-1/2 skeleton"></div></div>)
        : products.length===0 ? <div className="text-center py-16"><div className="text-5xl mb-3">📦</div><h3 className="text-lg font-bold text-gray-700">Belum Ada Produk</h3></div>
        : products.map(p=>(
          <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">{p.emoji||"📦"}</div>
            <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold truncate">{p.nama}</h4><p className="text-sm font-bold" style={{color:"#f59e0b"}}>Rp {(p.harga||0).toLocaleString("id")}</p></div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={()=>edit(p)} className="text-xs text-blue-500 font-semibold">Edit</button>
              <button onClick={()=>del(p.id)} className="text-xs text-red-400 font-semibold">Hapus</button>
              <button onClick={()=>toggle(p.id,p.tersedia)} className={"w-10 h-6 rounded-full relative transition-colors "+(p.tersedia!==false?"bg-green-500":"bg-gray-300")}><div className={"w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-transform "+(p.tersedia!==false?"translate-x-5":"translate-x-1")}></div></button>
            </div>
          </div>))}
      </div>
      <BottomNav role="seller" active="products" />
    </div>
  );
}
`);

// =============================================
// app/seller/pesanan/page.js
// =============================================
writeFile("app/seller/pesanan/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

const sb = { pending:{l:"⏳ Menunggu",c:"bg-gray-100 text-gray-600"}, confirmed:{l:"✅ Diterima",c:"bg-blue-50 text-blue-600"}, cooking:{l:"🍳 Dimasak",c:"bg-amber-50 text-amber-700"}, delivering:{l:"🛵 Diantar",c:"bg-purple-50 text-purple-600"}, done:{l:"✅ Selesai",c:"bg-green-50 text-green-600"}, cancelled:{l:"❌ Batal",c:"bg-red-50 text-red-600"} };

export default function SellerPesanan() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        if(!sq.empty) { const os = await getDocs(query(collection(db,"pesanan"),where("tokoId","==",sq.docs[0].id)));
          setOrders(os.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  const fil = filter==="all" ? orders : orders.filter(o=>o.status===filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4"><h1 className="text-xl font-black">📋 Semua Pesanan</h1></div>
      <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {[{id:"all",l:"Semua"},{id:"pending",l:"Menunggu"},{id:"confirmed",l:"Diterima"},{id:"cooking",l:"Dimasak"},{id:"done",l:"Selesai"}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} className={"px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 "+(filter===f.id?"bg-amber-500 text-white":"bg-gray-100 text-gray-600")}>{f.l}</button>))}
      </div>
      <div className="px-5 space-y-3">
        {loading ? [1,2,3].map(i=><div key={i} className="bg-white rounded-2xl p-4"><div className="h-16 skeleton"></div></div>)
        : fil.length===0 ? <div className="text-center py-16"><div className="text-5xl mb-3">📭</div><p className="text-gray-400">Tidak ada pesanan</p></div>
        : fil.map(o=>{const s=sb[o.status]||sb.pending; return(
          <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2"><div><p className="text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</p><h4 className="font-bold">👤 {o.pembeliNama}</h4></div><span className={"px-3 py-1 rounded-full text-xs font-semibold "+s.c}>{s.l}</span></div>
            <p className="text-sm text-gray-500">{o.items?.map(i=>i.nama+" x"+i.qty).join(", ")}</p>
            {o.catatan&&<p className="text-xs text-gray-400 mt-1">📝 {o.catatan}</p>}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100"><span className="font-bold" style={{color:"#f59e0b"}}>Rp {(o.totalHarga||0).toLocaleString("id")}</span><span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("id",{day:"numeric",month:"short"})}</span></div>
          </div>);})}
      </div>
      <BottomNav role="seller" active="orders" />
    </div>
  );
}
`);

// =============================================
// app/seller/profil/page.js
// =============================================
writeFile("app/seller/profil/page.js", `
export { default } from "@/app/buyer/profil/page";
`);

// =============================================
// DONE!
// =============================================
console.log("");
console.log("🎉 ========================================");
console.log("   SETUP SELESAI! Semua file telah dibuat.");
console.log("========================================");
console.log("");
console.log("📋 LANGKAH SELANJUTNYA:");
console.log("");
console.log("   1. Pastikan Firebase sudah di-setup:");
console.log("      - Authentication (Google + Email) aktif");
console.log("      - Firestore Database sudah dibuat");
console.log("");
console.log("   2. Jalankan aplikasi:");
console.log("      npm run dev");
console.log("");
console.log("   3. Buka di browser:");
console.log("      http://localhost:3000");
console.log("");
console.log("🔥 Loman - Local Market Nusantara");
console.log("   Belanja Setetangga 🏘️");
console.log("");
