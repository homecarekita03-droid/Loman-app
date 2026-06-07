"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import LocationPicker from "@/components/LocationPicker";
import { useLocation, getDistance, formatDistance } from "@/lib/useLocation";

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
  const { location: myLoc, loading: locLoading } = useLocation();
  const [stores, setStores] = useState([]);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLocPicker, setShowLocPicker] = useState(false);
  const [sortBy, setSortBy] = useState("distance"); // "distance" or "rating"

  useEffect(() => { if (!al && !user) router.push("/login"); }, [user, al, router]);
  useEffect(() => {
    async function f() {
      try { const s = await getDocs(collection(db, "toko")); setStores(s.docs.map(d => ({ id: d.id, ...d.data() }))); } catch(e) { console.error(e); }
      setLoading(false);
    }
    if (user) f();
  }, [user]);

  // Filter + hitung jarak + sort
  const processed = stores
    .map(s => {
      let dist = null;
      if (myLoc && s.lat && s.lng) {
        dist = getDistance(myLoc.lat, myLoc.lng, s.lat, s.lng);
      }
      return { ...s, distance: dist };
    })
    .filter(s => {
      const cm = cat === "all" || s.kategori?.toLowerCase() === cat;
      const sm = !search.trim() || s.nama?.toLowerCase().includes(search.toLowerCase()) || s.deskripsi?.toLowerCase().includes(search.toLowerCase());
      return cm && sm;
    })
    .sort((a, b) => {
      if (sortBy === "distance" && a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return (b.rating || 0) - (a.rating || 0);
    });

  const storeEmojis = { makanan: "🍳", kue: "🧁", minuman: "🥤", laundry: "👕", kebutuhan: "🧴" };
  const gradients = [
    "linear-gradient(135deg, #fee2e2, #fecaca)", "linear-gradient(135deg, #fef3c7, #fde68a)",
    "linear-gradient(135deg, #dbeafe, #bfdbfe)", "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    "linear-gradient(135deg, #fce7f3, #fbcfe8)", "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
  ];

  if (al) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5"}}><div style={{fontSize:"48px"}}>🏪</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", paddingBottom: "80px" }}>

      {/* ===== HEADER ===== */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
        padding: "0 0 24px 0", borderRadius: "0 0 24px 24px",
      }}>
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setShowLocPicker(true)} style={{
            background: "none", border: "none", cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "14px" }}>📍</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>Lokasi Anda</span>
            </div>
            <div style={{ color: "white", fontSize: "15px", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              {userData?.alamat || userData?.perumahan || (myLoc ? "Lokasi terdeteksi ✓" : "Atur Lokasi")}
              <span style={{ fontSize: "12px" }}>▼</span>
            </div>
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => router.push("/buyer/pesanan")} style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)", border: "none",
              fontSize: "18px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>📋</button>
          </div>
        </div>
        <div style={{ padding: "12px 20px 0" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", opacity: 0.5 }}>🔍</span>
            <input type="text" placeholder="Mau makan apa hari ini?"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: "14px", border: "none", fontSize: "14px", background: "white", outline: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
          </div>
        </div>
        {/* Location status */}
        {myLoc && (
          <div style={{ padding: "8px 20px 0", display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}></div>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>GPS aktif — menampilkan toko terdekat</span>
          </div>
        )}
      </div>

      {/* Location Picker Modal */}
      {showLocPicker && <LocationPicker
        onSelect={(pos, addr) => { console.log("Location selected:", pos, addr); }}
        onClose={() => setShowLocPicker(false)}
        initialLat={myLoc?.lat} initialLng={myLoc?.lng}
      />}

      {/* ===== PROMO ===== */}
      <div style={{ padding: "16px 0 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: "12px", padding: "0 20px", overflowX: "auto", scrollSnapType: "x mandatory" }} className="no-scrollbar">
          <div style={{ minWidth: "280px", borderRadius: "16px", padding: "18px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", position: "relative", overflow: "hidden", scrollSnapAlign: "start", flexShrink: 0 }}>
            <div style={{ fontSize: "11px", background: "rgba(255,255,255,0.2)", display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontWeight: 600, marginBottom: "6px" }}>PROMO 🔥</div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "2px" }}>Gratis Ongkir!</h3>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>Min. belanja Rp 20.000</p>
            <div style={{ position: "absolute", right: "10px", bottom: "8px", fontSize: "40px", opacity: 0.2 }}>🛵</div>
          </div>
          <div style={{ minWidth: "280px", borderRadius: "16px", padding: "18px", background: "linear-gradient(135deg, #059669, #10b981)", color: "white", position: "relative", overflow: "hidden", scrollSnapAlign: "start", flexShrink: 0 }}>
            <div style={{ fontSize: "11px", background: "rgba(255,255,255,0.2)", display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontWeight: 600, marginBottom: "6px" }}>BARU ✨</div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "2px" }}>Ajak Tetangga!</h3>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>Diskon 10% untuk user baru</p>
            <div style={{ position: "absolute", right: "10px", bottom: "8px", fontSize: "40px", opacity: 0.2 }}>🎉</div>
          </div>
        </div>
      </div>

      {/* ===== CATEGORIES ===== */}
      <div style={{ padding: "20px 20px 8px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" }}>Kategori</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              padding: "10px 4px", borderRadius: "14px", border: "none", cursor: "pointer",
              background: cat === c.id ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "white",
              boxShadow: cat === c.id ? "0 4px 12px rgba(245,158,11,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px",
                background: cat === c.id ? "linear-gradient(135deg, #f59e0b, #ea580c)" : "#f9fafb",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
              }}>{c.emoji}</div>
              <span style={{ fontSize: "10px", fontWeight: cat === c.id ? 700 : 500, color: cat === c.id ? "#d97706" : "#6b7280" }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== SORT BAR ===== */}
      <div style={{ padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1f2937" }}>
          {cat === "all" ? "Toko Terdekat" : categories.find(c=>c.id===cat)?.name}
          <span style={{ fontSize: "13px", fontWeight: 400, color: "#9ca3af", marginLeft: "6px" }}>({processed.length})</span>
        </h3>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setSortBy("distance")} style={{
            padding: "5px 12px", borderRadius: "20px", border: "none", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            background: sortBy === "distance" ? "#fef3c7" : "#f3f4f6",
            color: sortBy === "distance" ? "#d97706" : "#9ca3af",
          }}>📍 Terdekat</button>
          <button onClick={() => setSortBy("rating")} style={{
            padding: "5px 12px", borderRadius: "20px", border: "none", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            background: sortBy === "rating" ? "#fef3c7" : "#f3f4f6",
            color: sortBy === "rating" ? "#d97706" : "#9ca3af",
          }}>⭐ Rating</button>
        </div>
      </div>

      {/* ===== STORE LIST ===== */}
      <div style={{ padding: "4px 20px 0" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1,2,3].map(i => <div key={i} style={{ background: "white", borderRadius: "16px", overflow: "hidden" }}><div className="skeleton" style={{ height: "130px" }}></div><div style={{ padding: "14px" }}><div className="skeleton" style={{ height: "16px", width: "70%", marginBottom: "8px" }}></div><div className="skeleton" style={{ height: "12px", width: "40%" }}></div></div></div>)}
          </div>
        ) : processed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#374151" }}>{stores.length === 0 ? "Belum Ada Toko" : "Tidak Ditemukan"}</h3>
            <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>{stores.length === 0 ? "Ajak tetangga jualan di Loman!" : "Coba kata kunci lain"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {processed.map((s, idx) => (
              <div key={s.id} onClick={() => router.push("/buyer/toko/" + s.id)} style={{
                background: "white", borderRadius: "16px", overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer",
              }}>
                <div style={{
                  height: "120px", background: gradients[idx % gradients.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "50px", position: "relative",
                }}>
                  {storeEmojis[s.kategori?.toLowerCase()] || s.emoji || "🏪"}
                  <div style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: s.isOpen !== false ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)", color: "white" }}>
                    {s.isOpen !== false ? "● Buka" : "● Tutup"}
                  </div>
                  {/* Distance Badge */}
                  {s.distance !== null && (
                    <div style={{ position: "absolute", bottom: "10px", left: "10px", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: "rgba(0,0,0,0.65)", color: "white", display: "flex", alignItems: "center", gap: "4px" }}>
                      📍 {formatDistance(s.distance)}
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: "10px", right: "10px", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: "rgba(0,0,0,0.65)", color: "white" }}>
                    ⭐ {s.rating || "Baru"}
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937", marginBottom: "6px" }}>{s.nama}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6b7280", flexWrap: "wrap" }}>
                    <span>📍 {s.alamat || "Perumahan"}</span>
                    <span>•</span>
                    <span>🕐 {s.jamBuka||"08:00"}-{s.jamTutup||"20:00"}</span>
                    {s.distance !== null && <><span>•</span><span style={{ color: "#f59e0b", fontWeight: 600 }}>🛵 ~{Math.max(1, Math.round(s.distance * 3))} menit</span></>}
                  </div>
                  {s.deskripsi && <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "8px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>{s.deskripsi}</p>}
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#fef3c7", color: "#d97706", fontSize: "11px", fontWeight: 600 }}>Gratis Ongkir</span>
                    {s.distance !== null && s.distance < 1 && <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#d1fae5", color: "#059669", fontSize: "11px", fontWeight: 600 }}>Dekat!</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="buyer" active="home" />
    </div>
  );
}
