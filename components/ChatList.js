"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";

export default function ChatList({ onOpenChat, onClose }) {
  const { user, userData } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = userData?.role || "buyer";

  useEffect(() => {
    async function fetchChats() {
      if (!user) return;
      try {
        // Ambil semua pesanan user
        let q;
        if (role === "seller") {
          const sq = await getDocs(query(collection(db, "toko"), where("pemilikId", "==", user.uid)));
          if (sq.empty) { setLoading(false); return; }
          q = query(collection(db, "pesanan"), where("tokoId", "==", sq.docs[0].id));
        } else {
          q = query(collection(db, "pesanan"), where("pembeliId", "==", user.uid));
        }

        const snap = await getDocs(q);
        const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Untuk setiap pesanan, cek apakah ada chat
        const chatList = [];
        for (const order of orders) {
          try {
            const msgSnap = await getDocs(
              query(collection(db, "chats", order.id, "messages"), orderBy("createdAt", "desc"), limit(1))
            );
            if (!msgSnap.empty) {
              const lastMsg = msgSnap.docs[0].data();
              chatList.push({
                pesananId: order.id,
                tokoNama: order.tokoNama,
                pembeliNama: order.pembeliNama,
                lastMessage: lastMsg.text,
                lastTime: lastMsg.createdAt,
                lastSender: lastMsg.senderName,
                status: order.status,
              });
            }
          } catch (e) {}
        }

        // Sort by last message time
        chatList.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
        setChats(chatList);
      } catch (e) { console.error(e); }
      setLoading(false);
    }

    fetchChats();
  }, [user, role]);

  function timeAgo(iso) {
    if (!iso) return "";
    const m = Math.floor((new Date() - new Date(iso)) / 60000);
    if (m < 1) return "Baru";
    if (m < 60) return m + "m";
    if (m < 1440) return Math.floor(m / 60) + "j";
    return Math.floor(m / 1440) + "h";
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "white", width: "100%", maxWidth: "480px",
        borderRadius: "24px 24px 0 0", maxHeight: "85vh",
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 900 }}>💬 Riwayat Chat</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}><p style={{ color: "#9ca3af" }}>Memuat...</p></div>
          ) : chats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>💬</div>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>Belum ada riwayat chat</p>
              <p style={{ color: "#d1d5db", fontSize: "12px", marginTop: "4px" }}>Chat akan muncul setelah ada pesanan</p>
            </div>
          ) : chats.map((c, i) => (
            <button key={c.pesananId} onClick={() => onOpenChat(c)} style={{
              width: "100%", display: "flex", gap: "12px", padding: "14px 4px",
              borderBottom: i < chats.length - 1 ? "1px solid #f9fafb" : "none",
              alignItems: "center", background: "none", border: "none",
              borderBottomWidth: i < chats.length - 1 ? "1px" : "0",
              borderBottomStyle: "solid", borderBottomColor: "#f3f4f6",
              cursor: "pointer", textAlign: "left",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", flexShrink: 0,
              }}>{role === "seller" ? "🛒" : "🏪"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>
                    {role === "seller" ? c.pembeliNama : c.tokoNama}
                  </h4>
                  <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>{timeAgo(c.lastTime)}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.lastSender}: {c.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
