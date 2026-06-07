"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";

export default function NotifPanel({ onClose }) {
  const { user, userData } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = userData?.role || "buyer";

  useEffect(() => {
    if (!user) return;

    async function fetchNotifs() {
      try {
        let q;
        if (role === "seller") {
          // Penjual: ambil pesanan untuk toko mereka
          const sq = await getDocs(query(collection(db, "toko"), where("pemilikId", "==", user.uid)));
          if (sq.empty) { setLoading(false); return; }
          const tokoId = sq.docs[0].id;
          q = query(collection(db, "pesanan"), where("tokoId", "==", tokoId));
        } else {
          q = query(collection(db, "pesanan"), where("pembeliId", "==", user.uid));
        }

        const unsub = onSnapshot(q, (snap) => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20)
            .map(o => {
              let icon, text;
              if (role === "seller") {
                if (o.status === "pending") { icon = "🔔"; text = "Pesanan baru dari " + o.pembeliNama; }
                else if (o.status === "confirmed") { icon = "✅"; text = "Pesanan " + o.pembeliNama + " diterima"; }
                else if (o.status === "done") { icon = "🎉"; text = "Pesanan " + o.pembeliNama + " selesai"; }
                else if (o.status === "cancelled") { icon = "❌"; text = "Pesanan " + o.pembeliNama + " dibatalkan"; }
                else { icon = "📦"; text = "Pesanan " + o.pembeliNama + " — " + o.status; }
              } else {
                if (o.status === "pending") { icon = "⏳"; text = "Pesanan ke " + o.tokoNama + " menunggu konfirmasi"; }
                else if (o.status === "confirmed") { icon = "✅"; text = o.tokoNama + " menerima pesanan Anda"; }
                else if (o.status === "processing") { icon = "🔄"; text = o.tokoNama + " sedang memproses pesanan"; }
                else if (o.status === "delivering") { icon = "🛵"; text = "Pesanan dari " + o.tokoNama + " sedang diantar"; }
                else if (o.status === "done") { icon = "🎉"; text = "Pesanan dari " + o.tokoNama + " selesai!"; }
                else if (o.status === "cancelled") { icon = "❌"; text = "Pesanan ke " + o.tokoNama + " dibatalkan"; }
                else { icon = "📦"; text = "Update pesanan " + o.tokoNama; }
              }
              return { ...o, icon, text };
            });
          setNotifs(items);
          setLoading(false);
        });

        return () => unsub();
      } catch (e) { console.error(e); setLoading(false); }
    }

    fetchNotifs();
  }, [user, role]);

  function timeAgo(iso) {
    if (!iso) return "";
    const m = Math.floor((new Date() - new Date(iso)) / 60000);
    if (m < 1) return "Baru saja";
    if (m < 60) return m + " mnt";
    if (m < 1440) return Math.floor(m / 60) + " jam";
    return Math.floor(m / 1440) + " hari";
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "white", width: "100%", maxWidth: "480px",
        borderRadius: "24px 24px 0 0", maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#1f2937" }}>🔔 Notifikasi</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}><p style={{ color: "#9ca3af" }}>Memuat...</p></div>
          ) : notifs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔕</div>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>Belum ada notifikasi</p>
            </div>
          ) : notifs.map((n, i) => (
            <div key={n.id + i} style={{
              display: "flex", gap: "12px", padding: "12px 0",
              borderBottom: i < notifs.length - 1 ? "1px solid #f9fafb" : "none",
              alignItems: "flex-start",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px",
                background: n.status === "pending" ? "#fef3c7" : n.status === "done" ? "#d1fae5" : "#dbeafe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", flexShrink: 0,
              }}>{n.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", color: "#1f2937", lineHeight: 1.4 }}>{n.text}</p>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>{timeAgo(n.createdAt)}</span>
                  {n.totalHarga && <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 600 }}>Rp {n.totalHarga.toLocaleString("id")}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
