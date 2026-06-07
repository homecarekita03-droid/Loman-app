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
