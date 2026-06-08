// ============================================
// 👑 LOMAN ADMIN DASHBOARD
// ============================================
// Jalankan: node tambah-admin.js
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
console.log("👑 ========================================");
console.log("   LOMAN ADMIN DASHBOARD");
console.log("========================================");
console.log("");

// =============================================
// ADMIN DASHBOARD PAGE
// =============================================
writeFile("app/admin/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc } from "firebase/firestore";

// ⚠️ GANTI DENGAN EMAIL GOOGLE ANDA (yang login sebagai admin)
const ADMIN_EMAILS = ["homecarekita03@gmail.com"]; // Tambahkan email admin di sini

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [stats, setStats] = useState({ users: 0, sellers: 0, buyers: 0, stores: 0, products: 0, orders: 0, revenue: 0, ordersToday: 0, revenueToday: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!al && !user) { router.push("/login"); return; }
    if (user && !ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    if (user) setIsAdmin(true);
  }, [user, al, router]);

  useEffect(() => {
    async function fetchAll() {
      if (!user || !isAdmin) return;
      try {
        const [usersSnap, storesSnap, productsSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "toko")),
          getDocs(collection(db, "produk")),
          getDocs(collection(db, "pesanan")),
        ]);

        const userList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const storeList = storesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const productList = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const orderList = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setUsers(userList);
        setStores(storeList);
        setProducts(productList);
        setOrders(orderList);

        const today = new Date().toDateString();
        const todayOrders = orderList.filter(o => new Date(o.createdAt).toDateString() === today);
        const completedOrders = orderList.filter(o => o.status === "done");

        setStats({
          users: userList.length,
          sellers: userList.filter(u => u.role === "seller").length,
          buyers: userList.filter(u => u.role === "buyer").length,
          stores: storeList.length,
          products: productList.length,
          orders: orderList.length,
          revenue: completedOrders.reduce((s, o) => s + (o.totalHarga || 0), 0),
          ordersToday: todayOrders.length,
          revenueToday: todayOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.totalHarga || 0), 0),
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchAll();
  }, [user, isAdmin]);

  function formatRp(n) {
    if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(1) + "Jt";
    if (n >= 1000) return "Rp " + Math.round(n / 1000) + "K";
    return "Rp " + n;
  }

  function timeAgo(iso) {
    if (!iso) return "-";
    const m = Math.floor((new Date() - new Date(iso)) / 60000);
    if (m < 1) return "Baru";
    if (m < 60) return m + "m lalu";
    if (m < 1440) return Math.floor(m / 60) + "j lalu";
    return Math.floor(m / 1440) + "h lalu";
  }

  const statusColors = {
    pending: { bg: "#fef3c7", c: "#d97706", l: "⏳ Pending" },
    confirmed: { bg: "#dbeafe", c: "#2563eb", l: "✅ Diterima" },
    processing: { bg: "#e0e7ff", c: "#7c3aed", l: "🔄 Diproses" },
    delivering: { bg: "#fae8ff", c: "#a855f7", l: "🛵 Diantar" },
    done: { bg: "#d1fae5", c: "#059669", l: "✅ Selesai" },
    cancelled: { bg: "#fee2e2", c: "#dc2626", l: "❌ Batal" },
  };

  if (al || loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}><div style={{ textAlign: "center", color: "white" }}><div style={{ fontSize: "48px", marginBottom: "8px" }}>👑</div><p>Memuat Admin Dashboard...</p></div></div>;

  if (!isAdmin) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "white", padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔒</div>
      <h1 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>Akses Ditolak</h1>
      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>Halaman ini hanya untuk admin Loman.</p>
      <button onClick={() => router.push("/")} style={{ padding: "12px 32px", borderRadius: "12px", background: "#f59e0b", color: "#1f2937", border: "none", fontWeight: 700, cursor: "pointer" }}>Kembali ke Beranda</button>
    </div>
  );

  const tabs = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "users", icon: "👥", label: "Users (" + stats.users + ")" },
    { id: "stores", icon: "🏪", label: "Toko (" + stats.stores + ")" },
    { id: "orders", icon: "📦", label: "Pesanan (" + stats.orders + ")" },
    { id: "products", icon: "📋", label: "Produk (" + stats.products + ")" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>👑</span>
              <h1 style={{ fontSize: "20px", fontWeight: 900 }}>Admin Dashboard</h1>
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Loman — Local Market Nusantara</p>
          </div>
          <button onClick={() => router.push("/")} style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>← App</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "12px 16px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="no-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "8px 14px", borderRadius: "10px", border: "none",
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
            background: activeTab === t.id ? "#f59e0b" : "rgba(255,255,255,0.04)",
            color: activeTab === t.id ? "#1f2937" : "#94a3b8",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { icon: "👥", label: "Total User", value: stats.users, sub: stats.sellers + " penjual, " + stats.buyers + " pembeli", color: "#3b82f6" },
                { icon: "🏪", label: "Total Toko", value: stats.stores, sub: "aktif di platform", color: "#10b981" },
                { icon: "📦", label: "Total Pesanan", value: stats.orders, sub: stats.ordersToday + " hari ini", color: "#f59e0b" },
                { icon: "💰", label: "Total Pendapatan", value: formatRp(stats.revenue), sub: formatRp(stats.revenueToday) + " hari ini", color: "#ef4444" },
                { icon: "📋", label: "Total Produk", value: stats.products, sub: "terdaftar", color: "#8b5cf6" },
                { icon: "📊", label: "Rata-rata/Pesanan", value: stats.orders > 0 ? formatRp(Math.round(stats.revenue / Math.max(1, orders.filter(o => o.status === "done").length))) : "Rp 0", sub: "nilai pesanan", color: "#ec4899" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: "14px", padding: "14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.icon}</div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
                  <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>📦 Pesanan Terbaru</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {orders.slice(0, 8).map(o => {
                const st = statusColors[o.status] || statusColors.pending;
                return (
                  <div key={o.id} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>#{o.id.slice(-6).toUpperCase()}</span>
                        <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: st.bg, color: st.c }}>{st.l}</span>
                      </div>
                      <p style={{ fontSize: "13px", fontWeight: 600 }}>👤 {o.pembeliNama} → 🏪 {o.tokoNama}</p>
                      <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{o.items?.map(i => i.nama + " x" + i.qty).join(", ")}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#f59e0b" }}>Rp {(o.totalHarga || 0).toLocaleString("id")}</p>
                      <p style={{ fontSize: "10px", color: "#64748b" }}>{timeAgo(o.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status Distribution */}
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginTop: "20px", marginBottom: "10px" }}>📊 Distribusi Status Pesanan</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {Object.entries(statusColors).map(([key, val]) => {
                const count = orders.filter(o => o.status === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "18px", fontWeight: 900, color: val.c }}>{count}</span>
                    <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>{val.l}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== USERS TAB ===== */}
        {activeTab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", fontSize: "12px", color: "#60a5fa" }}>👥 Total: {stats.users}</div>
              <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", fontSize: "12px", color: "#fbbf24" }}>🏪 Penjual: {stats.sellers}</div>
              <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", fontSize: "12px", color: "#34d399" }}>🛒 Pembeli: {stats.buyers}</div>
            </div>
            {users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(u => (
              <div key={u.id} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: u.role === "seller" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  {u.role === "seller" ? "🏪" : u.role === "buyer" ? "🛒" : "👤"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600 }}>{u.nama || "No Name"}</h4>
                  <p style={{ fontSize: "11px", color: "#64748b" }}>{u.email}</p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px", fontSize: "11px", color: "#475569" }}>
                    {u.phone && <span>📱 {u.phone}</span>}
                    {u.perumahan && <span>📍 {u.perumahan}</span>}
                    {u.alamat && <span>🏠 {u.alamat}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: "10px", fontSize: "10px", fontWeight: 600,
                    background: u.role === "seller" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
                    color: u.role === "seller" ? "#fbbf24" : "#60a5fa",
                  }}>{u.role || "No Role"}</span>
                  <p style={{ fontSize: "10px", color: "#475569", marginTop: "4px" }}>{timeAgo(u.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== STORES TAB ===== */}
        {activeTab === "stores" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {stores.map(s => {
              const storeOrders = orders.filter(o => o.tokoId === s.id);
              const storeProducts = products.filter(p => p.tokoId === s.id);
              const storeRevenue = storeOrders.filter(o => o.status === "done").reduce((sum, o) => sum + (o.totalHarga || 0), 0);
              return (
                <div key={s.id} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: "14px", padding: "14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{s.emoji || "🏪"}</div>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{s.nama}</h4>
                        <p style={{ fontSize: "11px", color: "#64748b" }}>{s.alamat || "-"} • {s.kategori || "-"}</p>
                      </div>
                    </div>
                    <span style={{
                      padding: "4px 10px", borderRadius: "10px", fontSize: "10px", fontWeight: 600,
                      background: s.isOpen ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: s.isOpen ? "#34d399" : "#f87171",
                    }}>{s.isOpen ? "● Buka" : "● Tutup"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#f59e0b" }}>{storeProducts.length}</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>Produk</div>
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#3b82f6" }}>{storeOrders.length}</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>Pesanan</div>
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#10b981" }}>{formatRp(storeRevenue)}</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>Revenue</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {stores.length === 0 && <div style={{ textAlign: "center", padding: "40px" }}><div style={{ fontSize: "40px", marginBottom: "8px" }}>🏪</div><p style={{ color: "#64748b" }}>Belum ada toko</p></div>}
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {orders.slice(0, 30).map(o => {
              const st = statusColors[o.status] || statusColors.pending;
              return (
                <div key={o.id} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>#{o.id.slice(-8).toUpperCase()}</span>
                    <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: st.bg, color: st.c }}>{st.l}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px" }}>👤 {o.pembeliNama}</span>
                    <span style={{ fontSize: "13px" }}>🏪 {o.tokoNama}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#64748b" }}>{o.items?.map(i => i.nama + " x" + i.qty).join(", ")}</p>
                  {o.catatan && <p style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>📝 {o.catatan}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontWeight: 700, color: "#f59e0b" }}>Rp {(o.totalHarga || 0).toLocaleString("id")}</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{new Date(o.createdAt).toLocaleDateString("id", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === "products" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {products.map(p => {
              const store = stores.find(s => s.id === p.tokoId);
              return (
                <div key={p.id} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", gap: "12px", alignItems: "center",
                  opacity: p.tersedia !== false ? 1 : 0.5,
                }}>
                  {p.foto ? (
                    <img src={p.foto} alt="" style={{ width: "50px", height: "50px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "50px", height: "50px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{p.emoji || "📦"}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600 }}>{p.nama}</h4>
                    <p style={{ fontSize: "12px", color: "#64748b" }}>🏪 {store?.nama || "?"} • {p.kategori || "-"}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#f59e0b" }}>Rp {(p.harga || 0).toLocaleString("id")}</p>
                    <span style={{ fontSize: "10px", color: p.tersedia !== false ? "#34d399" : "#f87171" }}>{p.tersedia !== false ? "✅ Aktif" : "❌ Off"}</span>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && <div style={{ textAlign: "center", padding: "40px" }}><div style={{ fontSize: "40px", marginBottom: "8px" }}>📦</div><p style={{ color: "#64748b" }}>Belum ada produk</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
`);

console.log("");
console.log("🎉 ========================================");
console.log("   ADMIN DASHBOARD SELESAI!");
console.log("========================================");
console.log("");
console.log("   Akses: loman.store/admin");
console.log("");
console.log("   ⚠️  PENTING:");
console.log("   Buka file app/admin/page.js");
console.log("   Ganti email di ADMIN_EMAILS dengan");
console.log("   email Google ANDA yang dipakai login!");
console.log("");
console.log("   Fitur Admin:");
console.log("   ✅ Overview — semua statistik utama");
console.log("   ✅ Users — daftar semua user + role + info");
console.log("   ✅ Toko — semua toko + produk + revenue masing-masing");
console.log("   ✅ Pesanan — semua pesanan + status + detail");
console.log("   ✅ Produk — semua produk + foto + harga + toko");
console.log("   ✅ Akses terbatas (hanya email admin)");
console.log("   ✅ Dark theme (beda dari user biasa)");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Deploy:  git add . && git commit -m 'admin dashboard' && git push");
console.log("");
