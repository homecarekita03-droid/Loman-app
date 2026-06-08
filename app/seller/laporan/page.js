"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

export default function LaporanPage() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("today"); // today, week, month, all
  const [storeName, setStoreName] = useState("");

  useEffect(() => { if (!al && !user) router.push("/login"); }, [user, al, router]);

  useEffect(() => {
    async function f() {
      if (!user) return;
      try {
        const sq = await getDocs(query(collection(db, "toko"), where("pemilikId", "==", user.uid)));
        if (sq.empty) { setLoading(false); return; }
        const storeId = sq.docs[0].id;
        setStoreName(sq.docs[0].data().nama || "Toko Saya");

        const os = await getDocs(query(collection(db, "pesanan"), where("tokoId", "==", storeId)));
        setOrders(os.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    f();
  }, [user]);

  // Filter by period
  function getFilteredOrders() {
    const now = new Date();
    return orders.filter(o => {
      if (o.status === "cancelled") return false;
      const d = new Date(o.createdAt);
      if (period === "today") return d.toDateString() === now.toDateString();
      if (period === "week") {
        const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      if (period === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true; // "all"
    });
  }

  const filtered = getFilteredOrders();
  const completedOrders = filtered.filter(o => o.status === "done");
  const activeOrders = filtered.filter(o => !["done", "cancelled"].includes(o.status));

  // Stats
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.totalHarga || 0), 0);
  const totalOrders = filtered.length;
  const completedCount = completedOrders.length;
  const avgOrderValue = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;
  const pendingRevenue = activeOrders.reduce((s, o) => s + (o.totalHarga || 0), 0);

  // Produk terlaris
  const productSales = {};
  filtered.forEach(o => {
    o.items?.forEach(item => {
      if (!productSales[item.nama]) productSales[item.nama] = { nama: item.nama, qty: 0, revenue: 0 };
      productSales[item.nama].qty += item.qty;
      productSales[item.nama].revenue += item.harga * item.qty;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Daily breakdown (untuk grafik sederhana)
  const dailyData = {};
  filtered.forEach(o => {
    const day = new Date(o.createdAt).toLocaleDateString("id", { day: "numeric", month: "short" });
    if (!dailyData[day]) dailyData[day] = { revenue: 0, orders: 0 };
    dailyData[day].revenue += (o.totalHarga || 0);
    dailyData[day].orders += 1;
  });
  const dailyEntries = Object.entries(dailyData).slice(-7);
  const maxRevenue = Math.max(...dailyEntries.map(([, v]) => v.revenue), 1);

  // Pelanggan terbanyak
  const customerData = {};
  filtered.forEach(o => {
    const name = o.pembeliNama || "Unknown";
    if (!customerData[name]) customerData[name] = { nama: name, orders: 0, total: 0 };
    customerData[name].orders += 1;
    customerData[name].total += (o.totalHarga || 0);
  });
  const topCustomers = Object.values(customerData).sort((a, b) => b.orders - a.orders).slice(0, 5);

  function formatRp(num) {
    if (num >= 1000000) return "Rp " + (num / 1000000).toFixed(1) + "Jt";
    if (num >= 1000) return "Rp " + Math.round(num / 1000) + "K";
    return "Rp " + num;
  }

  const periodLabels = { today: "Hari Ini", week: "7 Hari", month: "Bulan Ini", all: "Semua" };

  if (al || loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: "48px" }}>📊</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", paddingBottom: "80px" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b, #ea580c)",
        padding: "20px 20px 28px", borderRadius: "0 0 24px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <button onClick={() => router.push("/seller")} style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "rgba(255,255,255,0.2)", border: "none",
            cursor: "pointer", fontSize: "16px", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>←</button>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 900, color: "white" }}>Laporan Penjualan</h1>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>🏪 {storeName}</p>
          </div>
        </div>

        {/* Period Tabs */}
        <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "4px" }}>
          {["today", "week", "month", "all"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, padding: "10px 4px", borderRadius: "10px", border: "none",
              fontSize: "12px", fontWeight: 700, cursor: "pointer",
              background: period === p ? "white" : "transparent",
              color: period === p ? "#ea580c" : "rgba(255,255,255,0.7)",
              transition: "all 0.2s",
            }}>{periodLabels[p]}</button>
          ))}
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {/* Total Pendapatan */}
          <div style={{
            background: "white", borderRadius: "16px", padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            gridColumn: "1 / -1",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>💰 Total Pendapatan</p>
                <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#f59e0b", marginTop: "4px" }}>
                  {formatRp(totalRevenue)}
                </h2>
              </div>
              <div style={{
                padding: "6px 12px", borderRadius: "20px",
                background: "#d1fae5", color: "#059669",
                fontSize: "12px", fontWeight: 700,
              }}>{periodLabels[period]}</div>
            </div>
            {pendingRevenue > 0 && (
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
                + {formatRp(pendingRevenue)} sedang diproses
              </p>
            )}
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: "11px", color: "#9ca3af" }}>📦 Total Pesanan</p>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#1f2937", marginTop: "4px" }}>{totalOrders}</h3>
            <p style={{ fontSize: "11px", color: "#10b981", marginTop: "2px" }}>{completedCount} selesai</p>
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: "11px", color: "#9ca3af" }}>📊 Rata-rata</p>
            <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#1f2937", marginTop: "4px" }}>{formatRp(avgOrderValue)}</h3>
            <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>per pesanan</p>
          </div>
        </div>
      </div>

      {/* ===== GRAFIK HARIAN ===== */}
      {dailyEntries.length > 1 && (
        <div style={{ padding: "20px 20px 0" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "14px" }}>📈 Grafik Pendapatan</h3>
          <div style={{
            background: "white", borderRadius: "16px", padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
              {dailyEntries.map(([day, data], i) => {
                const height = Math.max(8, (data.revenue / maxRevenue) * 100);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700 }}>
                      {data.revenue >= 1000 ? Math.round(data.revenue / 1000) + "K" : data.revenue}
                    </span>
                    <div style={{
                      width: "100%", height: height + "%", minHeight: "8px",
                      borderRadius: "6px 6px 2px 2px",
                      background: "linear-gradient(to top, #f59e0b, #fbbf24)",
                    }}></div>
                    <span style={{ fontSize: "9px", color: "#9ca3af" }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== PRODUK TERLARIS ===== */}
      {topProducts.length > 0 && (
        <div style={{ padding: "20px 20px 0" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" }}>🏆 Produk Terlaris</h3>
          <div style={{
            background: "white", borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            {topProducts.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
                borderBottom: i < topProducts.length - 1 ? "1px solid #f9fafb" : "none",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: i === 0 ? "#fef3c7" : i === 1 ? "#f3f4f6" : i === 2 ? "#ffedd5" : "#f9fafb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: 800, flexShrink: 0,
                  color: i === 0 ? "#d97706" : i === 1 ? "#6b7280" : "#ea580c",
                }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{p.nama}</h4>
                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>Terjual {p.qty}x</p>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#f59e0b", flexShrink: 0 }}>
                  {formatRp(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== PELANGGAN TERBANYAK ===== */}
      {topCustomers.length > 0 && (
        <div style={{ padding: "20px 20px 0" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" }}>👥 Pelanggan Setia</h3>
          <div style={{
            background: "white", borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            {topCustomers.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
                borderBottom: i < topCustomers.length - 1 ? "1px solid #f9fafb" : "none",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#dbeafe",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", flexShrink: 0,
                }}>👤</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{c.nama}</h4>
                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>{c.orders} pesanan</p>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#6b7280" }}>{formatRp(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== RIWAYAT TRANSAKSI ===== */}
      <div style={{ padding: "20px 20px 0" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" }}>📋 Riwayat Transaksi</h3>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>📭</div>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>Belum ada transaksi {periodLabels[period].toLowerCase()}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.slice(0, 20).map(o => {
              const statusColors = {
                pending: { bg: "#f3f4f6", c: "#6b7280", l: "⏳ Menunggu" },
                confirmed: { bg: "#dbeafe", c: "#2563eb", l: "✅ Diterima" },
                processing: { bg: "#fef3c7", c: "#d97706", l: "🔄 Diproses" },
                delivering: { bg: "#e0e7ff", c: "#7c3aed", l: "🛵 Diantar" },
                done: { bg: "#d1fae5", c: "#059669", l: "✅ Selesai" },
                cancelled: { bg: "#fee2e2", c: "#dc2626", l: "❌ Batal" },
              };
              const st = statusColors[o.status] || statusColors.pending;
              return (
                <div key={o.id} style={{
                  background: "white", borderRadius: "14px", padding: "12px 14px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>#{o.id.slice(-6).toUpperCase()}</span>
                      <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#1f2937" }}>{o.pembeliNama}</h4>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, background: st.bg, color: st.c }}>{st.l}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>{o.items?.map(i => i.nama + " x" + i.qty).join(", ")}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f9fafb" }}>
                    <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: "14px" }}>Rp {(o.totalHarga || 0).toLocaleString("id")}</span>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>{new Date(o.createdAt).toLocaleDateString("id", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav role="seller" active="home" />
    </div>
  );
}
