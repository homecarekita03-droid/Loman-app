"use client";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";

export default function ChatRoom({ pesananId, tokoNama, pembeliNama, onClose }) {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const myRole = userData?.role || "buyer";

  useEffect(() => {
    if (!pesananId) return;
    const chatRef = collection(db, "chats", pesananId, "messages");
    const q = query(chatRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [pesananId]);

  async function send(e) {
    e.preventDefault();
    if (!newMsg.trim() || !user || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, "chats", pesananId, "messages"), {
        text: newMsg.trim(),
        senderId: user.uid,
        senderName: userData?.nama || "User",
        senderRole: myRole,
        createdAt: new Date().toISOString(),
      });
      setNewMsg("");
      inputRef.current?.focus();
    } catch (err) { console.error(err); }
    setSending(false);
  }

  function formatTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit" });
  }

  const quickReplies = myRole === "seller"
    ? ["Pesanan sedang dimasak 🍳", "Sudah siap, segera diantar 🛵", "Terima kasih! 🙏"]
    : ["Baik, ditunggu ya 👍", "Sudah sampai, terima kasih! 🙏", "Bisa tambah sambal? 🌶️"];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      display: "flex", flexDirection: "column",
      background: "#f5f5f5", maxWidth: "480px", margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b, #ea580c)",
        padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px",
      }}>
        <button onClick={onClose} style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "rgba(255,255,255,0.2)", border: "none",
          color: "white", fontSize: "18px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>←</button>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "white" }}>
            💬 {myRole === "seller" ? pembeliNama : tokoNama}
          </h3>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
            Pesanan #{pesananId?.slice(-6).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{
          textAlign: "center", padding: "10px", background: "#fef3c7",
          borderRadius: "10px", fontSize: "11px", color: "#92400e", marginBottom: "8px",
        }}>🔒 Chat pesanan #{pesananId?.slice(-6).toUpperCase()}</div>

        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>💬</div>
            <p style={{ color: "#9ca3af", fontSize: "13px" }}>Belum ada pesan. Mulai chat!</p>
          </div>
        )}

        {messages.map(msg => {
          const mine = msg.senderId === user?.uid;
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: "10px 14px",
                borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: mine ? "linear-gradient(135deg, #f59e0b, #ea580c)" : "white",
                color: mine ? "white" : "#1f2937",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}>
                {!mine && <p style={{ fontSize: "11px", fontWeight: 700, color: msg.senderRole === "seller" ? "#f59e0b" : "#3b82f6", marginBottom: "3px" }}>
                  {msg.senderRole === "seller" ? "🏪" : "🛒"} {msg.senderName}
                </p>}
                <p style={{ fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word" }}>{msg.text}</p>
                <p style={{ fontSize: "10px", marginTop: "3px", opacity: 0.6, textAlign: "right" }}>{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* Quick Replies */}
      <div style={{ padding: "6px 12px 0", display: "flex", gap: "6px", overflowX: "auto" }} className="no-scrollbar">
        {quickReplies.map((q, i) => (
          <button key={i} onClick={() => setNewMsg(q)} style={{
            padding: "6px 12px", borderRadius: "18px", background: "#f3f4f6",
            border: "1px solid #e5e7eb", fontSize: "11px", color: "#4b5563",
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={send} style={{
        padding: "10px 12px 14px", display: "flex", gap: "8px",
        background: "white", borderTop: "1px solid #f3f4f6",
      }}>
        <input ref={inputRef} type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
          placeholder="Ketik pesan..." style={{
            flex: 1, padding: "12px 16px", border: "2px solid #e5e7eb",
            borderRadius: "24px", fontSize: "14px", outline: "none", background: "#f9fafb",
          }}
          onFocus={e => e.target.style.borderColor = "#f59e0b"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        <button type="submit" disabled={!newMsg.trim() || sending} style={{
          width: "44px", height: "44px", borderRadius: "50%",
          background: newMsg.trim() ? "linear-gradient(135deg, #f59e0b, #ea580c)" : "#e5e7eb",
          border: "none", cursor: newMsg.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", color: "white", flexShrink: 0,
        }}>{sending ? "⏳" : "➤"}</button>
      </form>
    </div>
  );
}
