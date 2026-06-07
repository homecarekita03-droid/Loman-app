// ============================================
// 💬 LOMAN - Tambah Fitur Chat
// ============================================
// Jalankan: node tambah-chat.js
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
console.log("💬 ========================================");
console.log("   Menambahkan Fitur Chat ke Loman...");
console.log("========================================");
console.log("");

// =============================================
// 1. Chat Component (Reusable)
// =============================================
writeFile("components/ChatRoom.js", `
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
`);

// =============================================
// 2. Update Buyer Pesanan — tambah tombol Chat
// =============================================
writeFile("app/buyer/pesanan/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import ChatRoom from "@/components/ChatRoom";

const sc = { pending:{l:"⏳ Menunggu",c:"bg-gray-100 text-gray-600"}, confirmed:{l:"✅ Diterima",c:"bg-blue-50 text-blue-600"}, cooking:{l:"🍳 Dimasak",c:"bg-amber-50 text-amber-700"}, delivering:{l:"🛵 Diantar",c:"bg-purple-50 text-purple-600"}, done:{l:"✅ Selesai",c:"bg-green-50 text-green-600"}, cancelled:{l:"❌ Batal",c:"bg-red-50 text-red-600"} };

export default function PesananBuyer() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOrder, setChatOrder] = useState(null);

  useEffect(() => { if (!al && !user) router.push("/login"); }, [user, al, router]);
  useEffect(() => {
    async function f() {
      if (!user) return;
      try { const s = await getDocs(query(collection(db,"pesanan"),where("pembeliId","==",user.uid))); setOrders(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  function ft(iso) { if(!iso)return""; const d=new Date(iso),n=new Date(),m=Math.floor((n-d)/60000); if(m<1)return"Baru saja"; if(m<60)return m+" menit lalu"; if(m<1440)return Math.floor(m/60)+" jam lalu"; return d.toLocaleDateString("id",{day:"numeric",month:"short"}); }

  // Jika chat terbuka
  if (chatOrder) {
    return (
      <ChatRoom
        pesananId={chatOrder.id}
        tokoId={chatOrder.tokoId}
        tokoNama={chatOrder.tokoNama}
        pembeliNama={chatOrder.pembeliNama}
        onClose={() => setChatOrder(null)}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", paddingBottom: "96px" }}>
      <div style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "16px 20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#1f2937" }}>📋 Pesanan Saya</h1>
      </div>
      {loading ? (
        <div style={{ padding: "16px 20px" }}>
          {[1,2,3].map(i => <div key={i} style={{ background: "white", borderRadius: "16px", padding: "16px", marginBottom: "12px" }}><div className="skeleton" style={{ height: "16px", width: "75%", marginBottom: "8px" }}></div><div className="skeleton" style={{ height: "12px", width: "50%" }}></div></div>)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📋</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#374151" }}>Belum Ada Pesanan</h3>
          <button onClick={() => router.push("/buyer")} style={{ marginTop: "24px", padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", border: "none", fontWeight: 600, cursor: "pointer" }}>Mulai Belanja</button>
        </div>
      ) : (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {orders.map(o => {
            const s = sc[o.status] || sc.pending;
            const canChat = o.status !== "cancelled" && o.status !== "done";
            return (
              <div key={o.id} style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>#{o.id.slice(-8).toUpperCase()}</p>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>{o.tokoNama}</h4>
                  </div>
                  <span className={s.c} style={{ padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: 600 }}>{s.l}</span>
                </div>
                {/* Items */}
                <p style={{ fontSize: "14px", color: "#6b7280" }}>{o.items?.map(i => i.nama + " x" + i.qty).join(", ")}</p>
                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
                  <span style={{ fontWeight: 700, color: "#f59e0b" }}>Rp {(o.totalHarga || 0).toLocaleString("id")}</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {canChat && (
                      <button onClick={() => setChatOrder(o)} style={{
                        padding: "6px 14px", borderRadius: "20px",
                        background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                        color: "white", border: "none", fontSize: "12px",
                        fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}>💬 Chat</button>
                    )}
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{ft(o.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <BottomNav role="buyer" active="orders" />
    </div>
  );
}
`);

// =============================================
// 3. Update Seller Dashboard — tambah tombol Chat
// =============================================
writeFile("app/seller/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import ChatRoom from "@/components/ChatRoom";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, userData, loading: al } = useAuth();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ today: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [chatOrder, setChatOrder] = useState(null);

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

  if (al||loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:"48px",animation:"pulse 1.5s infinite"}}>🏪</div></div>;

  // Jika chat terbuka
  if (chatOrder) {
    return (
      <ChatRoom
        pesananId={chatOrder.id}
        tokoId={chatOrder.tokoId}
        tokoNama={chatOrder.tokoNama || store?.nama}
        pembeliNama={chatOrder.pembeliNama}
        onClose={() => setChatOrder(null)}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", paddingBottom: "96px" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "12px", color: "#9ca3af" }}>🏪 {store?.nama}</p>
          <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#1f2937" }}>Dashboard</h1>
        </div>
        <button onClick={toggleStore} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}>
          <div style={{
            width: "48px", height: "28px", borderRadius: "50px", position: "relative",
            background: store?.isOpen ? "#10b981" : "#d1d5db", transition: "background 0.2s",
          }}>
            <div style={{
              width: "22px", height: "22px", borderRadius: "50%", background: "white",
              position: "absolute", top: "3px",
              left: store?.isOpen ? "23px" : "3px",
              transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}></div>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: store?.isOpen ? "#10b981" : "#9ca3af" }}>
            {store?.isOpen ? "● Buka" : "● Tutup"}
          </span>
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>📦</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#1f2937" }}>{stats.today}</div>
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>Pesanan Hari Ini</div>
        </div>
        <div style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>💰</div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: "#f59e0b" }}>Rp {stats.revenue >= 1000 ? Math.round(stats.revenue/1000)+"K" : stats.revenue}</div>
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>Pendapatan</div>
        </div>
      </div>

      {/* Pending Orders */}
      {pending.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#1f2937" }}>🔔 Pesanan Masuk ({pending.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pending.map(o => (
              <div key={o.id} style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "4px solid #f59e0b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ fontWeight: 700, color: "#1f2937" }}>👤 {o.pembeliNama}</h4>
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>{new Date(o.createdAt).toLocaleTimeString("id",{hour:"2-digit",minute:"2-digit"})}</span>
                </div>
                <div style={{ fontSize: "14px", color: "#4b5563", marginBottom: "8px", lineHeight: 1.8 }}>{o.items?.map(i => "• " + i.nama + " x" + i.qty).join("\\n")}</div>
                {o.catatan && <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>📝 {o.catatan}</p>}
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#f59e0b", marginBottom: "12px" }}>Rp {(o.totalHarga||0).toLocaleString("id")}</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => updateStatus(o.id,"cancelled")} style={{ flex: 1, padding: "10px", borderRadius: "12px", background: "#f3f4f6", color: "#4b5563", border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>✗ Tolak</button>
                  <button onClick={() => updateStatus(o.id,"confirmed")} style={{ flex: 1, padding: "10px", borderRadius: "12px", background: "#10b981", color: "white", border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>✓ Terima</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Orders */}
      {active.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#1f2937" }}>🍳 Pesanan Aktif ({active.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {active.map(o => (
              <div key={o.id} style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ fontWeight: 600, fontSize: "14px", color: "#1f2937" }}>👤 {o.pembeliNama}</h4>
                  <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "50px", background: "#eff6ff", color: "#2563eb", fontWeight: 600 }}>
                    {o.status==="confirmed"?"✅ Diterima":o.status==="cooking"?"🍳 Dimasak":"🛵 Diantar"}
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "12px" }}>{o.items?.map(i=>i.nama+" x"+i.qty).join(", ")}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {/* Chat Button */}
                  <button onClick={() => setChatOrder(o)} style={{
                    padding: "10px 16px", borderRadius: "12px",
                    background: "white", border: "2px solid #f59e0b",
                    color: "#f59e0b", fontWeight: 600, fontSize: "13px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                  }}>💬 Chat</button>
                  {ns[o.status] && (
                    <button onClick={() => updateStatus(o.id,ns[o.status])} style={{
                      flex: 1, padding: "10px", borderRadius: "12px",
                      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                      color: "white", border: "none", fontWeight: 600,
                      fontSize: "13px", cursor: "pointer",
                    }}>{nl[o.status]}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!pending.length && !active.length && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>📭</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#374151" }}>Belum Ada Pesanan</h3>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>Pesanan dari pembeli akan muncul di sini</p>
        </div>
      )}

      <BottomNav role="seller" active="home" />
    </div>
  );
}
`);

// =============================================
// 4. Update Firestore Rules info
// =============================================
writeFile("FIREBASE-RULES.md", `
# 🔒 Firebase Firestore Rules

Buka Firebase Console → Firestore Database → Rules
Ganti isinya dengan ini:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    // Toko
    match /toko/{tokoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    // Produk
    match /produk/{produkId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    // Pesanan
    match /pesanan/{pesananId} {
      allow read, write: if request.auth != null;
    }
    // Chats
    match /chats/{chatId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

Klik **Publish** untuk menyimpan.
`);

console.log("");
console.log("🎉 ========================================");
console.log("   FITUR CHAT BERHASIL DITAMBAHKAN!");
console.log("========================================");
console.log("");
console.log("   Fitur yang ditambahkan:");
console.log("   ✅ Chat real-time (Firestore)");
console.log("   ✅ Bubble chat (seperti WhatsApp)");
console.log("   ✅ Quick reply buttons");
console.log("   ✅ Tombol Chat di pesanan pembeli");
console.log("   ✅ Tombol Chat di dashboard penjual");
console.log("   ✅ Header chat dengan info pesanan");
console.log("   ✅ Auto-scroll ke pesan terbaru");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Buka: http://localhost:3000");
console.log("");
console.log("   ⚠️  PENTING: Update Firestore Rules!");
console.log("   Baca file FIREBASE-RULES.md");
console.log("");
