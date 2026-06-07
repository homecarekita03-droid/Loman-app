// ============================================
// ✨ LOMAN UI UPGRADE — Tampilan Pro ala ShopeeFood/GrabFood
// ============================================
// Jalankan: node upgrade-ui.js
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
console.log("✨ ========================================");
console.log("   LOMAN UI UPGRADE — Pro Edition");
console.log("   Tampilan ala ShopeeFood / GrabFood");
console.log("========================================");
console.log("");

// =============================================
// 1. BUYER HOME — Redesign Total
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
  { id: "all", emoji: "🔥", name: "Semua" },
  { id: "makanan", emoji: "🍚", name: "Makanan" },
  { id: "kue", emoji: "🧁", name: "Kue & Snack" },
  { id: "minuman", emoji: "🥤", name: "Minuman" },
  { id: "laundry", emoji: "👕", name: "Laundry" },
  { id: "kebutuhan", emoji: "🧴", name: "Kebutuhan" },
  { id: "lainnya", emoji: "📦", name: "Lainnya" },
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
    const sm = !search.trim() || s.nama?.toLowerCase().includes(search.toLowerCase()) || s.deskripsi?.toLowerCase().includes(search.toLowerCase());
    return cm && sm;
  });

  const storeEmojis = { makanan: "🍳", kue: "🧁", minuman: "🥤", laundry: "👕", kebutuhan: "🧴" };

  if (al) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f9fafb"}}><div style={{textAlign:"center"}}><div style={{fontSize:"48px",marginBottom:"8px"}}>🏪</div><p style={{color:"#9ca3af",fontSize:"14px"}}>Memuat...</p></div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", paddingBottom: "80px" }}>

      {/* ===== HEADER ===== */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
        padding: "0 0 24px 0",
        borderRadius: "0 0 24px 24px",
        position: "relative",
      }}>
        {/* Top bar */}
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px" }}>📍</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>Diantar ke</span>
            </div>
            <h2 style={{ color: "white", fontSize: "16px", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              {userData?.alamat || userData?.perumahan || "Atur Alamat"} 
              <span style={{ fontSize: "12px" }}>▼</span>
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)", border: "none",
              fontSize: "18px", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>🔔</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 20px 0" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", opacity: 0.5 }}>🔍</span>
            <input
              type="text" placeholder="Mau makan apa hari ini?"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px 14px 44px",
                borderRadius: "14px", border: "none", fontSize: "14px",
                background: "white", outline: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== PROMO BANNERS (Carousel) ===== */}
      <div style={{ padding: "16px 0 0", overflow: "hidden" }}>
        <div style={{
          display: "flex", gap: "12px", padding: "0 20px",
          overflowX: "auto", scrollSnapType: "x mandatory",
        }} className="no-scrollbar">
          {/* Banner 1 */}
          <div style={{
            minWidth: "300px", borderRadius: "16px", padding: "20px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white", position: "relative", overflow: "hidden",
            scrollSnapAlign: "start", flexShrink: 0,
          }}>
            <div style={{ fontSize: "11px", background: "rgba(255,255,255,0.2)", display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontWeight: 600, marginBottom: "8px" }}>PROMO 🔥</div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>Gratis Ongkir!</h3>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>Min. belanja Rp 20.000</p>
            <div style={{ position: "absolute", right: "12px", bottom: "12px", fontSize: "48px", opacity: 0.2 }}>🛵</div>
          </div>
          {/* Banner 2 */}
          <div style={{
            minWidth: "300px", borderRadius: "16px", padding: "20px",
            background: "linear-gradient(135deg, #059669, #10b981)",
            color: "white", position: "relative", overflow: "hidden",
            scrollSnapAlign: "start", flexShrink: 0,
          }}>
            <div style={{ fontSize: "11px", background: "rgba(255,255,255,0.2)", display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontWeight: 600, marginBottom: "8px" }}>BARU ✨</div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>Ajak Tetangga!</h3>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>Diskon 10% untuk user baru</p>
            <div style={{ position: "absolute", right: "12px", bottom: "12px", fontSize: "48px", opacity: 0.2 }}>🎉</div>
          </div>
          {/* Banner 3 */}
          <div style={{
            minWidth: "300px", borderRadius: "16px", padding: "20px",
            background: "linear-gradient(135deg, #dc2626, #f59e0b)",
            color: "white", position: "relative", overflow: "hidden",
            scrollSnapAlign: "start", flexShrink: 0,
          }}>
            <div style={{ fontSize: "11px", background: "rgba(255,255,255,0.2)", display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontWeight: 600, marginBottom: "8px" }}>SPESIAL 🌟</div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>Menu Hari Ini</h3>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>Lihat rekomendasi dari tetangga</p>
            <div style={{ position: "absolute", right: "12px", bottom: "12px", fontSize: "48px", opacity: 0.2 }}>🍽️</div>
          </div>
        </div>
      </div>

      {/* ===== CATEGORIES ===== */}
      <div style={{ padding: "20px 20px 8px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1f2937", marginBottom: "14px" }}>Kategori</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
              padding: "12px 4px", borderRadius: "16px", border: "none", cursor: "pointer",
              background: cat === c.id ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "white",
              boxShadow: cat === c.id ? "0 4px 12px rgba(245,158,11,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
              transition: "all 0.2s",
              transform: cat === c.id ? "scale(1.02)" : "scale(1)",
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "14px",
                background: cat === c.id ? "linear-gradient(135deg, #f59e0b, #ea580c)" : "#f9fafb",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", transition: "all 0.2s",
              }}>{c.emoji}</div>
              <span style={{
                fontSize: "11px", fontWeight: cat === c.id ? 700 : 500,
                color: cat === c.id ? "#d97706" : "#6b7280",
              }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== STORE LIST ===== */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1f2937" }}>
            {cat === "all" ? "Toko Terdekat" : categories.find(c=>c.id===cat)?.name || "Toko"} 
            <span style={{ fontSize: "13px", fontWeight: 400, color: "#9ca3af", marginLeft: "6px" }}>({filtered.length})</span>
          </h3>
          <button style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Lihat Semua</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: "white", borderRadius: "16px", overflow: "hidden" }}>
                <div className="skeleton" style={{ height: "140px" }}></div>
                <div style={{ padding: "14px" }}>
                  <div className="skeleton" style={{ height: "16px", width: "70%", marginBottom: "8px" }}></div>
                  <div className="skeleton" style={{ height: "12px", width: "40%" }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#374151" }}>
              {stores.length === 0 ? "Belum Ada Toko" : "Tidak Ditemukan"}
            </h3>
            <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>
              {stores.length === 0 ? "Ajak tetangga untuk jualan di Loman!" : "Coba kata kunci lain"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((s, idx) => {
              const gradients = [
                "linear-gradient(135deg, #fee2e2, #fecaca)",
                "linear-gradient(135deg, #fef3c7, #fde68a)",
                "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                "linear-gradient(135deg, #fce7f3, #fbcfe8)",
                "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
              ];
              return (
                <div key={s.id} onClick={() => router.push("/buyer/toko/" + s.id)} style={{
                  background: "white", borderRadius: "16px", overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                >
                  {/* Banner */}
                  <div style={{
                    height: "130px", background: gradients[idx % gradients.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "56px", position: "relative",
                  }}>
                    {storeEmojis[s.kategori?.toLowerCase()] || s.emoji || "🏪"}
                    {/* Status Badge */}
                    <div style={{
                      position: "absolute", top: "10px", right: "10px",
                      padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: s.isOpen !== false ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)",
                      color: "white",
                      backdropFilter: "blur(4px)",
                    }}>{s.isOpen !== false ? "● Buka" : "● Tutup"}</div>
                    {/* Rating Badge */}
                    <div style={{
                      position: "absolute", bottom: "10px", left: "10px",
                      padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                      background: "rgba(0,0,0,0.6)", color: "white",
                      display: "flex", alignItems: "center", gap: "4px",
                      backdropFilter: "blur(4px)",
                    }}>⭐ {s.rating || "Baru"}</div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937", marginBottom: "6px" }}>{s.nama}</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#6b7280" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>📍 {s.alamat || "Perumahan"}</span>
                      <span>•</span>
                      <span>{s.jamBuka || "08:00"}-{s.jamTutup || "20:00"}</span>
                    </div>
                    {s.deskripsi && (
                      <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "8px", lineHeight: 1.4,
                        overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2,
                      }}>{s.deskripsi}</p>
                    )}
                    {/* Tags */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#fef3c7", color: "#d97706", fontSize: "11px", fontWeight: 600 }}>Gratis Ongkir</span>
                      {s.kategori && <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#f3f4f6", color: "#6b7280", fontSize: "11px", fontWeight: 500 }}>{s.kategori}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav role="buyer" active="home" />
    </div>
  );
}
`);

// =============================================
// 2. BUYER TOKO DETAIL — Redesign
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
  const [activeProdCat, setActiveProdCat] = useState("all");

  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem("loman_cart")||"[]")); } catch(e){} }, []);
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

  function removeFromCart(productId) {
    setCart(prev => {
      const ex = prev.find(i => i.id === productId);
      if (ex && ex.qty > 1) return prev.map(i => i.id === productId ? { ...i, qty: i.qty - 1 } : i);
      return prev.filter(i => i.id !== productId);
    });
  }

  const cartTotal = cart.reduce((s, i) => s + i.qty, 0);
  const cartPrice = cart.reduce((s, i) => s + i.harga * i.qty, 0);
  const gradients = ["#fef3c7","#dbeafe","#d1fae5","#fce7f3","#e0e7ff","#fee2e2"];

  if (loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:"48px"}}>🏪</div></div>;
  if (!store) return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}><div style={{fontSize:"56px",marginBottom:"16px"}}>😕</div><h2 style={{fontSize:"20px",fontWeight:700}}>Toko Tidak Ditemukan</h2><button onClick={()=>router.push("/buyer")} style={{marginTop:"16px",color:"#f59e0b",fontWeight:600,background:"none",border:"none",cursor:"pointer",fontSize:"15px"}}>← Kembali</button></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", paddingBottom: cartTotal > 0 ? "160px" : "80px" }}>

      {/* ===== STORE HEADER ===== */}
      <div style={{ position: "relative" }}>
        <button onClick={() => router.push("/buyer")} style={{
          position: "absolute", top: "14px", left: "14px", zIndex: 10,
          width: "38px", height: "38px", borderRadius: "50%",
          background: "rgba(255,255,255,0.95)", border: "none",
          cursor: "pointer", fontSize: "18px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>←</button>
        <div style={{
          height: "200px",
          background: "linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "80px",
        }}>{store.emoji || "🏪"}</div>
      </div>

      {/* Store Info Card */}
      <div style={{
        background: "white", margin: "-20px 16px 0", borderRadius: "20px",
        padding: "20px", position: "relative", zIndex: 5,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#1f2937" }}>{store.nama}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "20px", background: "#fef3c7", fontSize: "12px", fontWeight: 700, color: "#d97706" }}>⭐ {store.rating || "Baru"}</span>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>📍 {store.alamat || "-"}</span>
            </div>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
            background: store.isOpen !== false ? "#d1fae5" : "#fee2e2",
            color: store.isOpen !== false ? "#065f46" : "#991b1b",
          }}>{store.isOpen !== false ? "● Buka" : "● Tutup"}</div>
        </div>
        <div style={{ display: "flex", gap: "16px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>🕐 {store.jamBuka||"08:00"} - {store.jamTutup||"20:00"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>🛵 Gratis ongkir</div>
        </div>
        {store.deskripsi && <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "10px", lineHeight: 1.5 }}>{store.deskripsi}</p>}
      </div>

      {/* ===== PRODUCTS ===== */}
      <div style={{ padding: "20px 16px 0" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937", marginBottom: "16px" }}>
          Menu <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "14px" }}>({products.length} item)</span>
        </h3>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "white", borderRadius: "16px" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>📦</div>
            <p style={{ color: "#9ca3af" }}>Belum ada produk</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {products.map((p, i) => {
              const inCart = cart.find(c => c.id === p.id);
              return (
                <div key={p.id} style={{
                  background: "white", borderRadius: "16px", padding: "14px",
                  display: "flex", gap: "14px", alignItems: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                  {/* Product Image */}
                  <div style={{
                    width: "80px", height: "80px", borderRadius: "14px",
                    background: gradients[i % gradients.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "36px", flexShrink: 0,
                  }}>{p.emoji || "📦"}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#1f2937", marginBottom: "4px" }}>{p.nama}</h4>
                    {p.deskripsi && <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px", overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 1 }}>{p.deskripsi}</p>}
                    <p style={{ fontSize: "16px", fontWeight: 800, color: "#f59e0b" }}>Rp {(p.harga||0).toLocaleString("id")}</p>
                  </div>

                  {/* Add/Qty Button */}
                  {inCart ? (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      background: "#fff7ed", borderRadius: "12px", padding: "4px",
                    }}>
                      <button onClick={(e) => { e.stopPropagation(); removeFromCart(p.id); }} style={{
                        width: "32px", height: "32px", borderRadius: "10px", border: "none",
                        background: "white", fontSize: "16px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                      }}>−</button>
                      <span style={{ fontWeight: 800, fontSize: "15px", minWidth: "24px", textAlign: "center", color: "#d97706" }}>{inCart.qty}</span>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} style={{
                        width: "32px", height: "32px", borderRadius: "10px", border: "none",
                        background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white",
                        fontSize: "16px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>+</button>
                    </div>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} style={{
                      width: "36px", height: "36px", borderRadius: "12px", border: "none",
                      background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white",
                      fontSize: "20px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                    }}>+</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== FLOATING CART BAR ===== */}
      {cartTotal > 0 && (
        <div style={{
          position: "fixed", bottom: "72px", left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: "450px", padding: "0 16px", zIndex: 50,
          animation: "slideUp 0.3s ease",
        }}>
          <button onClick={() => router.push("/buyer/keranjang")} style={{
            width: "100%", padding: "16px 20px", borderRadius: "18px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "white", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 8px 30px rgba(234,88,12,0.35)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 800,
              }}>{cartTotal}</div>
              <span style={{ fontWeight: 700, fontSize: "15px" }}>Lihat Keranjang</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: "16px" }}>Rp {cartPrice.toLocaleString("id")}</span>
          </button>
        </div>
      )}

      <BottomNav role="buyer" active="home" />
    </div>
  );
}
`);

// =============================================
// 3. BUYER KERANJANG — Redesign
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

  if (success) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", background:"white" }}>
      <div style={{ width:"100px", height:"100px", borderRadius:"50%", background:"linear-gradient(135deg,#d1fae5,#a7f3d0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"48px", marginBottom:"20px" }}>🎉</div>
      <h2 style={{ fontSize:"24px", fontWeight:900, color:"#1f2937", marginBottom:"8px" }}>Pesanan Berhasil!</h2>
      <p style={{ fontSize:"14px", color:"#6b7280", textAlign:"center", lineHeight:1.6, maxWidth:"280px" }}>Pesanan Anda sudah dikirim ke penjual. Tunggu konfirmasi ya!</p>
      <button onClick={()=>router.push("/buyer/pesanan")} style={{ marginTop:"24px", padding:"14px 32px", borderRadius:"14px", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer", boxShadow:"0 4px 16px rgba(245,158,11,0.3)" }}>Lihat Pesanan Saya</button>
      <button onClick={()=>router.push("/buyer")} style={{ marginTop:"12px", padding:"12px 32px", borderRadius:"14px", background:"none", border:"none", color:"#6b7280", fontWeight:600, fontSize:"14px", cursor:"pointer" }}>Kembali Belanja</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", paddingBottom: cart.length > 0 ? "180px" : "80px" }}>
      {/* Header */}
      <div style={{
        background: "white", padding: "16px 20px",
        display: "flex", alignItems: "center", gap: "12px",
        borderBottom: "1px solid #f3f4f6",
      }}>
        <button onClick={() => router.back()} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <h1 style={{ fontSize: "18px", fontWeight: 900, color: "#1f2937" }}>Keranjang <span style={{ color:"#9ca3af", fontWeight:400 }}>({cart.reduce((s,i)=>s+i.qty,0)})</span></h1>
      </div>

      {cart.length === 0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 24px" }}>
          <div style={{ fontSize:"64px", marginBottom:"16px" }}>🛒</div>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"#374151" }}>Keranjang Kosong</h3>
          <p style={{ fontSize:"14px", color:"#9ca3af", marginTop:"4px" }}>Yuk pesan dari tetangga!</p>
          <button onClick={()=>router.push("/buyer")} style={{ marginTop:"20px", padding:"12px 28px", borderRadius:"12px", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", border:"none", fontWeight:600, cursor:"pointer" }}>Mulai Belanja</button>
        </div>
      ) : (
        <>
          {/* Toko Name */}
          <div style={{ padding:"16px 20px 8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", color:"#6b7280" }}>
              <span>🏪</span>
              <span style={{ fontWeight:600, color:"#1f2937" }}>{cart[0]?.tokoNama}</span>
            </div>
          </div>

          {/* Cart Items */}
          <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:"8px" }}>
            {cart.map(i => (
              <div key={i.id} style={{
                background: "white", borderRadius: "14px", padding: "14px",
                display: "flex", alignItems: "center", gap: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"12px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", flexShrink:0 }}>{i.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h4 style={{ fontSize:"14px", fontWeight:600, color:"#1f2937" }}>{i.nama}</h4>
                  <p style={{ fontSize:"14px", fontWeight:800, color:"#f59e0b", marginTop:"2px" }}>Rp {(i.harga*i.qty).toLocaleString("id")}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"4px", background:"#fff7ed", borderRadius:"10px", padding:"4px" }}>
                  <button onClick={()=>changeQty(i.id,-1)} style={{ width:"30px", height:"30px", borderRadius:"8px", border:"none", background:"white", fontSize:"15px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 2px rgba(0,0,0,0.06)" }}>−</button>
                  <span style={{ fontWeight:800, fontSize:"14px", minWidth:"20px", textAlign:"center", color:"#d97706" }}>{i.qty}</span>
                  <button onClick={()=>changeQty(i.id,1)} style={{ width:"30px", height:"30px", borderRadius:"8px", border:"none", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", fontSize:"15px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Catatan */}
          <div style={{ padding:"12px 16px" }}>
            <div style={{ background:"white", borderRadius:"14px", padding:"14px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <label style={{ fontSize:"13px", fontWeight:600, color:"#374151", marginBottom:"8px", display:"block" }}>📝 Catatan untuk penjual</label>
              <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Contoh: Tidak pedas, extra sambal..." rows={2}
                style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"13px", resize:"none", outline:"none", background:"#f9fafb", transition:"border-color 0.2s" }}
                onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            position:"fixed", bottom:"64px", left:"50%", transform:"translateX(-50%)",
            width:"100%", maxWidth:"480px", background:"white",
            borderTop:"1px solid #f3f4f6", padding:"16px 20px",
            boxShadow:"0 -4px 16px rgba(0,0,0,0.06)", zIndex:40,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
              <div>
                <p style={{ fontSize:"12px", color:"#9ca3af" }}>Total Pembayaran</p>
                <p style={{ fontSize:"22px", fontWeight:900, color:"#1f2937" }}>Rp {total.toLocaleString("id")}</p>
              </div>
              <div style={{ fontSize:"12px", color:"#6b7280", textAlign:"right" }}>
                <p>💵 Bayar di tempat (COD)</p>
              </div>
            </div>
            <button onClick={checkout} disabled={loading} style={{
              width:"100%", padding:"15px", borderRadius:"14px", border:"none",
              background: loading ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
              color:"white", fontWeight:700, fontSize:"16px", cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : "0 4px 16px rgba(245,158,11,0.3)",
            }}>{loading ? "Memproses... ⏳" : "Pesan Sekarang 🛵"}</button>
          </div>
        </>
      )}
      <BottomNav role="buyer" active="cart" />
    </div>
  );
}
`);

// =============================================
// 4. BOTTOM NAV — Redesign Pro
// =============================================
writeFile("components/BottomNav.js", `
"use client";
import { useRouter } from "next/navigation";

export default function BottomNav({ role, active }) {
  const router = useRouter();

  const buyerMenu = [
    { id: "home", icon: "🏠", iconActive: "🏠", label: "Beranda", path: "/buyer" },
    { id: "cart", icon: "🛒", iconActive: "🛒", label: "Keranjang", path: "/buyer/keranjang" },
    { id: "orders", icon: "📋", iconActive: "📋", label: "Pesanan", path: "/buyer/pesanan" },
    { id: "profile", icon: "👤", iconActive: "👤", label: "Profil", path: "/buyer/profil" },
  ];

  const sellerMenu = [
    { id: "home", icon: "📊", iconActive: "📊", label: "Dashboard", path: "/seller" },
    { id: "products", icon: "📦", iconActive: "📦", label: "Produk", path: "/seller/produk" },
    { id: "orders", icon: "📋", iconActive: "📋", label: "Pesanan", path: "/seller/pesanan" },
    { id: "profile", icon: "👤", iconActive: "👤", label: "Profil", path: "/seller/profil" },
  ];

  const menu = role === "seller" ? sellerMenu : buyerMenu;

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: "480px",
      background: "white",
      borderTop: "1px solid #f3f4f6",
      display: "flex", justifyContent: "space-around",
      padding: "6px 0 10px",
      zIndex: 100,
      boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
    }}>
      {menu.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => router.push(item.path)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "2px", padding: "4px 12px", background: "none", border: "none",
            cursor: "pointer", position: "relative",
          }}>
            {/* Active indicator */}
            {isActive && <div style={{
              position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)",
              width: "24px", height: "3px", borderRadius: "2px",
              background: "linear-gradient(90deg, #f59e0b, #ea580c)",
            }}></div>}
            <span style={{
              fontSize: "22px",
              filter: isActive ? "none" : "grayscale(0.5)",
              opacity: isActive ? 1 : 0.6,
              transition: "all 0.2s",
            }}>{item.icon}</span>
            <span style={{
              fontSize: "10px", fontWeight: isActive ? 800 : 500,
              color: isActive ? "#f59e0b" : "#9ca3af",
              transition: "all 0.2s",
            }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
`);

console.log("");
console.log("🎉 ========================================");
console.log("   UI UPGRADE SELESAI!");
console.log("========================================");
console.log("");
console.log("   Perubahan:");
console.log("   ✅ Buyer Home — Header gradient + search pro");
console.log("   ✅ Promo Banner Carousel (swipe)");
console.log("   ✅ Kategori Grid 4 kolom (ala ShopeeFood)");
console.log("   ✅ Store Cards dengan gradient & badges");
console.log("   ✅ Toko Detail — Card overlay + list view");
console.log("   ✅ Produk +/- counter inline (ala GrabFood)");
console.log("   ✅ Floating Cart Bar dengan total harga");
console.log("   ✅ Keranjang — Redesign pro");
console.log("   ✅ Checkout success animation");
console.log("   ✅ Bottom Nav dengan active indicator");
console.log("   ✅ Hover effects & smooth transitions");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Buka: http://localhost:3000");
console.log("");
