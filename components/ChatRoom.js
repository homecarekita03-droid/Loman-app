"use client";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";

export default function ChatRoom({ pesananId, tokoId, tokoNama, pembeliNama, onClose }) {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Nama & role pengirim
  const myName = userData?.nama || "User";
  const myRole = userData?.role || "buyer";

  // Listen to messages real-time
  useEffect(() => {
    if (!pesananId) return;

    const chatRef = collection(db, "chats", pesananId, "messages");
    const q = query(chatRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      // Auto scroll ke bawah
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsub();
  }, [pesananId]);

  // Send message
  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim() || !user || sending) return;

    setSending(true);
    try {
      const chatRef = collection(db, "chats", pesananId, "messages");
      await addDoc(chatRef, {
        text: newMsg.trim(),
        senderId: user.uid,
        senderName: myName,
        senderRole: myRole,
        createdAt: new Date().toISOString(),
      });
      setNewMsg("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Error sending message:", err);
    }
    setSending(false);
  }

  // Format waktu
  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit" });
  }

  // Cek apakah pesan dari saya
  function isMyMessage(msg) {
    return msg.senderId === user?.uid;
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      display: "flex", flexDirection: "column",
      background: "#f9fafb",
      maxWidth: "480px", margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b, #ea580c)",
        padding: "16px 20px",
        display: "flex", alignItems: "center", gap: "12px",
        color: "white",
      }}>
        <button onClick={onClose} style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "rgba(255,255,255,0.2)", border: "none",
          color: "white", fontSize: "18px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>←</button>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
            💬 {myRole === "seller" ? pembeliNama : tokoNama}
          </h3>
          <p style={{ fontSize: "11px", opacity: 0.8 }}>
            Chat Pesanan #{pesananId?.slice(-6).toUpperCase()}
          </p>
        </div>
        <div style={{
          width: "10px", height: "10px", borderRadius: "50%",
          background: "#4ade80", boxShadow: "0 0 6px #4ade80",
        }}></div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: "8px",
      }}>
        {/* Info awal */}
        <div style={{
          textAlign: "center", padding: "12px",
          background: "#fef3c7", borderRadius: "12px",
          fontSize: "12px", color: "#92400e",
          marginBottom: "8px",
        }}>
          🔒 Chat ini terkait pesanan #{pesananId?.slice(-6).toUpperCase()}<br/>
          Gunakan chat untuk koordinasi pesanan
        </div>

        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>
              Belum ada pesan.<br/>Mulai percakapan!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const mine = isMyMessage(msg);
          return (
            <div key={msg.id} style={{
              display: "flex",
              justifyContent: mine ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: mine
                  ? "linear-gradient(135deg, #f59e0b, #ea580c)"
                  : "white",
                color: mine ? "white" : "#1f2937",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}>
                {/* Sender name (hanya untuk pesan orang lain) */}
                {!mine && (
                  <p style={{
                    fontSize: "11px", fontWeight: 700,
                    color: msg.senderRole === "seller" ? "#f59e0b" : "#3b82f6",
                    marginBottom: "4px",
                  }}>
                    {msg.senderRole === "seller" ? "🏪" : "🛒"} {msg.senderName}
                  </p>
                )}
                <p style={{ fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word" }}>
                  {msg.text}
                </p>
                <p style={{
                  fontSize: "10px", marginTop: "4px",
                  opacity: 0.6, textAlign: "right",
                }}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* Quick Replies */}
      <div style={{
        padding: "8px 16px 0",
        display: "flex", gap: "6px", overflowX: "auto",
      }}>
        {(myRole === "seller"
          ? ["Pesanan sedang dimasak 🍳", "Sudah siap, segera diantar 🛵", "Terima kasih! 🙏"]
          : ["Baik, ditunggu ya 👍", "Sudah sampai, terima kasih! 🙏", "Bisa tambah sambal? 🌶️"]
        ).map((quick, i) => (
          <button key={i} onClick={() => setNewMsg(quick)} style={{
            padding: "6px 12px", borderRadius: "20px",
            background: "#f3f4f6", border: "1px solid #e5e7eb",
            fontSize: "11px", color: "#4b5563", cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>{quick}</button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{
        padding: "12px 16px 16px",
        display: "flex", gap: "8px", alignItems: "center",
        background: "white", borderTop: "1px solid #e5e7eb",
      }}>
        <input
          ref={inputRef}
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Ketik pesan..."
          style={{
            flex: 1, padding: "12px 16px",
            border: "2px solid #e5e7eb", borderRadius: "24px",
            fontSize: "14px", outline: "none",
            background: "#f9fafb",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#f59e0b"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
        <button type="submit" disabled={!newMsg.trim() || sending} style={{
          width: "44px", height: "44px", borderRadius: "50%",
          background: newMsg.trim() ? "linear-gradient(135deg, #f59e0b, #ea580c)" : "#e5e7eb",
          border: "none", cursor: newMsg.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", color: "white",
          transition: "background 0.2s",
          flexShrink: 0,
        }}>
          {sending ? "⏳" : "➤"}
        </button>
      </form>
    </div>
  );
}
