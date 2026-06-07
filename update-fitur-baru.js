// ============================================
// 🔥 LOMAN UPDATE — 5 Fitur Baru
// ============================================
// 1. Edit Toko (nama, deskripsi, emoji, jam, dll)
// 2. Status "Diproses" bukan "Dimasak"
// 3. Share produk ke WA/Medsos
// 4. Chat langsung antar penjual & pembeli (tanpa harus pesan)
// 5. Notifikasi
//
// Jalankan: node update-fitur-baru.js
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
console.log("🔥 ========================================");
console.log("   LOMAN — 5 Fitur Baru");
console.log("========================================");
console.log("");

// =============================================
// 1. NOTIFIKASI COMPONENT
// =============================================
writeFile("components/NotifPanel.js", `
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
`);

// =============================================
// 2. SHARE COMPONENT
// =============================================
writeFile("components/ShareProduct.js", `
"use client";

export default function ShareProduct({ product, tokoNama, onClose }) {
  const url = typeof window !== "undefined" ? window.location.origin + "/buyer/toko/" + product.tokoId : "";

  const text = "🛒 *" + product.nama + "*\\n"
    + "💰 Rp " + (product.harga || 0).toLocaleString("id") + "\\n"
    + (product.deskripsi ? "📝 " + product.deskripsi + "\\n" : "")
    + "🏪 " + (tokoNama || "Toko di Loman") + "\\n\\n"
    + "Pesan sekarang di 👉 " + url + "\\n"
    + "_Loman — Belanja Setetangga 🏘️_";

  const encodedText = encodeURIComponent(text);

  const shares = [
    { name: "WhatsApp", icon: "💬", color: "#25D366", url: "https://wa.me/?text=" + encodedText },
    { name: "Telegram", icon: "✈️", color: "#0088cc", url: "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodedText },
    { name: "Facebook", icon: "📘", color: "#1877F2", url: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) + "&quote=" + encodedText },
    { name: "Twitter/X", icon: "🐦", color: "#1DA1F2", url: "https://twitter.com/intent/tweet?text=" + encodedText },
    { name: "Copy Link", icon: "🔗", color: "#6b7280", url: null },
  ];

  function handleShare(s) {
    if (s.url) {
      window.open(s.url, "_blank");
    } else {
      navigator.clipboard?.writeText(url + "\\n\\n" + text.replace(/\\\\n/g, "\\n")).then(() => {
        alert("Link berhasil dicopy! Paste di mana saja.");
      }).catch(() => {
        prompt("Copy link ini:", url);
      });
    }
  }

  // Native share (mobile)
  function nativeShare() {
    if (navigator.share) {
      navigator.share({ title: product.nama, text: text.replace(/\\\\n/g, "\\n").replace(/[*_]/g, ""), url });
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "white", width: "100%", maxWidth: "480px",
        borderRadius: "24px 24px 0 0", padding: "24px 20px 32px",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>📤 Bagikan Produk</h3>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>

        {/* Product preview */}
        <div style={{ display: "flex", gap: "12px", padding: "12px", background: "#f9fafb", borderRadius: "14px", marginBottom: "20px", alignItems: "center" }}>
          {product.foto ? (
            <img src={product.foto} alt="" style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>{product.emoji || "📦"}</div>
          )}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700 }}>{product.nama}</h4>
            <p style={{ fontSize: "14px", fontWeight: 800, color: "#f59e0b" }}>Rp {(product.harga || 0).toLocaleString("id")}</p>
          </div>
        </div>

        {/* Native share button (mobile) */}
        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{
            width: "100%", padding: "14px", borderRadius: "14px", marginBottom: "12px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer",
          }}>📤 Bagikan...</button>
        )}

        {/* Share options */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
          {shares.map(s => (
            <button key={s.name} onClick={() => handleShare(s)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              padding: "12px 4px", borderRadius: "14px", border: "none",
              background: "#f9fafb", cursor: "pointer",
            }}>
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
              <span style={{ fontSize: "10px", color: "#6b7280", fontWeight: 500 }}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

// =============================================
// 3. CHAT LIST COMPONENT (Riwayat Chat)
// =============================================
writeFile("components/ChatList.js", `
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
`);

// =============================================
// 4. SELLER TOKO SETTING — Edit Tampilan Toko
// =============================================
writeFile("app/seller/toko-setting/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import LocationPicker from "@/components/LocationPicker";

const tokoEmojis = ["🏪","🍳","🧁","🥤","👕","🧴","🍕","🍔","☕","🌮","🍜","🥘","🍱","🧆","🛒","🎂"];

export default function TokoSetting() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLoc, setShowLoc] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nama:"", deskripsi:"", alamat:"", emoji:"🏪",
    kategori:"makanan", jamBuka:"08:00", jamTutup:"20:00", whatsapp:"",
  });

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        if(!sq.empty) {
          const s = {id:sq.docs[0].id,...sq.docs[0].data()};
          setStore(s);
          setForm({
            nama:s.nama||"", deskripsi:s.deskripsi||"", alamat:s.alamat||"",
            emoji:s.emoji||"🏪", kategori:s.kategori||"makanan",
            jamBuka:s.jamBuka||"08:00", jamTutup:s.jamTutup||"20:00",
            whatsapp:s.whatsapp||"",
          });
        }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  async function save() {
    if(!store) return; setSaving(true);
    try {
      await updateDoc(doc(db,"toko",store.id), form);
      setStore(p=>({...p,...form}));
      setSaved(true); setTimeout(()=>setSaved(false), 2000);
    } catch(e){ alert("Gagal."); }
    setSaving(false);
  }

  async function saveLocation(pos) {
    if(!store) return;
    try {
      await updateDoc(doc(db,"toko",store.id), { lat:pos.lat, lng:pos.lng });
      setStore(p=>({...p, lat:pos.lat, lng:pos.lng}));
    } catch(e){ console.error(e); }
  }

  const inputStyle = {
    width:"100%", padding:"14px 16px", border:"2px solid #e5e7eb",
    borderRadius:"14px", fontSize:"14px", outline:"none",
    background:"#f9fafb", transition:"border-color 0.2s",
  };

  const kategoriList = [
    {v:"makanan",l:"🍚 Makanan"},{v:"kue",l:"🧁 Kue"},{v:"minuman",l:"🥤 Minuman"},
    {v:"laundry",l:"👕 Laundry"},{v:"kebutuhan",l:"🧴 Kebutuhan"},{v:"lainnya",l:"📦 Lainnya"},
  ];

  if (loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:"48px"}}>🏪</div></div>;

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"100px" }}>
      {/* Header */}
      <div style={{ background:"white", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:"12px", position:"sticky", top:0, zIndex:50 }}>
        <button onClick={()=>router.push("/seller")} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <h1 style={{ fontSize:"18px", fontWeight:900 }}>⚙️ Pengaturan Toko</h1>
      </div>

      {/* Preview Card */}
      <div style={{ padding:"16px 20px" }}>
        <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"8px" }}>Preview tampilan toko Anda:</p>
        <div style={{ background:"white", borderRadius:"16px", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ height:"100px", background:"linear-gradient(135deg, #fef3c7, #fed7aa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"48px" }}>{form.emoji}</div>
          <div style={{ padding:"14px" }}>
            <h3 style={{ fontSize:"16px", fontWeight:800 }}>{form.nama || "Nama Toko"}</h3>
            <div style={{ display:"flex", gap:"8px", marginTop:"4px", fontSize:"12px", color:"#6b7280" }}>
              <span>⭐ {store?.rating || "Baru"}</span>
              <span>📍 {form.alamat || "-"}</span>
              <span>🕐 {form.jamBuka}-{form.jamTutup}</span>
            </div>
            {form.deskripsi && <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"6px" }}>{form.deskripsi}</p>}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:"12px" }}>
        {/* Emoji Toko */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>Ikon Toko</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:"6px" }}>
            {tokoEmojis.map(e => (
              <button key={e} onClick={()=>setForm(f=>({...f,emoji:e}))} style={{
                width:"100%", aspectRatio:"1", borderRadius:"10px", border:"none",
                fontSize:"22px", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: form.emoji===e ? "#fef3c7" : "#f9fafb",
                boxShadow: form.emoji===e ? "0 0 0 2px #f59e0b" : "none",
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Nama */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🏪 Nama Toko</label>
          <input value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} placeholder="Dapur Bu Sari" style={inputStyle}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* Deskripsi */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>📝 Deskripsi</label>
          <textarea value={form.deskripsi} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))}
            placeholder="Aneka masakan rumahan, kue, dll..." rows={3}
            style={{...inputStyle, resize:"none"}}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* Kategori */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>📂 Kategori Utama</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px" }}>
            {kategoriList.map(k => (
              <button key={k.v} onClick={()=>setForm(f=>({...f,kategori:k.v}))} style={{
                padding:"10px", borderRadius:"10px", border:"none", fontSize:"12px",
                fontWeight:600, cursor:"pointer", textAlign:"center",
                background: form.kategori===k.v ? "#fef3c7" : "#f9fafb",
                color: form.kategori===k.v ? "#d97706" : "#6b7280",
                boxShadow: form.kategori===k.v ? "0 0 0 2px #f59e0b" : "none",
              }}>{k.l}</button>
            ))}
          </div>
        </div>

        {/* Alamat */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>📍 Alamat</label>
          <input value={form.alamat} onChange={e=>setForm(f=>({...f,alamat:e.target.value}))} placeholder="Blok A No. 15" style={inputStyle}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* GPS */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🗺️ Lokasi GPS</label>
          {store?.lat ? (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:"13px", color:"#10b981", fontWeight:600 }}>✅ Sudah diatur</p>
                <p style={{ fontSize:"11px", color:"#9ca3af" }}>{store.lat.toFixed(4)}, {store.lng.toFixed(4)}</p>
              </div>
              <button onClick={()=>setShowLoc(true)} style={{ padding:"8px 16px", borderRadius:"10px", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600 }}>Ubah</button>
            </div>
          ) : (
            <button onClick={()=>setShowLoc(true)} style={{ width:"100%", padding:"14px", borderRadius:"12px", background:"#dbeafe", border:"2px dashed #93c5fd", cursor:"pointer", fontSize:"14px", fontWeight:600, color:"#2563eb" }}>
              📍 Atur Lokasi di Peta
            </button>
          )}
        </div>

        {/* Jam Buka */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🕐 Jam Buka</label>
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            <input type="time" value={form.jamBuka} onChange={e=>setForm(f=>({...f,jamBuka:e.target.value}))} style={{...inputStyle, flex:1}} />
            <span style={{ color:"#9ca3af" }}>—</span>
            <input type="time" value={form.jamTutup} onChange={e=>setForm(f=>({...f,jamTutup:e.target.value}))} style={{...inputStyle, flex:1}} />
          </div>
        </div>

        {/* WhatsApp */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>💬 No. WhatsApp</label>
          <input value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))} placeholder="08xxxxxxxxxx" style={inputStyle}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* Save */}
        <button onClick={save} disabled={saving} style={{
          width:"100%", padding:"16px", borderRadius:"14px", border:"none",
          background: saved ? "#10b981" : saving ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
          color:"white", fontWeight:800, fontSize:"16px",
          cursor: saving ? "default" : "pointer",
          boxShadow: saving ? "none" : "0 4px 12px rgba(245,158,11,0.3)",
          marginTop:"4px", transition:"background 0.3s",
        }}>{saved ? "✅ Tersimpan!" : saving ? "Menyimpan..." : "💾 Simpan Pengaturan"}</button>
      </div>

      {showLoc && <LocationPicker
        initialLat={store?.lat} initialLng={store?.lng}
        onSelect={(pos, addr) => { saveLocation(pos); setForm(f=>({...f,alamat:addr.split(",").slice(0,3).join(",")})); }}
        onClose={()=>setShowLoc(false)}
      />}

      <BottomNav role="seller" active="profile" />
    </div>
  );
}
`);

// =============================================
// 5. SELLER DASHBOARD — Update semua fitur
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
import ChatList from "@/components/ChatList";
import NotifPanel from "@/components/NotifPanel";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, userData, loading: al } = useAuth();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ today:0, revenue:0 });
  const [loading, setLoading] = useState(true);
  const [chatOrder, setChatOrder] = useState(null);
  const [showChatList, setShowChatList] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        let sid;
        if(sq.empty) {
          const nr = doc(collection(db,"toko"));
          const ns = { nama:"Toko "+(userData?.nama||"Saya"), pemilikId:user.uid, kategori:"makanan", deskripsi:"", alamat:userData?.alamat||"", jamBuka:"08:00", jamTutup:"20:00", emoji:"🏪", rating:0, isOpen:true, createdAt:new Date().toISOString() };
          await setDoc(nr,ns); setStore({id:nr.id,...ns}); sid=nr.id;
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
  }, [user,userData]);

  async function toggleStore() { if(!store)return; const n=!store.isOpen; await updateDoc(doc(db,"toko",store.id),{isOpen:n}); setStore(p=>({...p,isOpen:n})); }
  async function updateStatus(id,s) { await updateDoc(doc(db,"pesanan",id),{status:s}); setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o)); }

  const pending = orders.filter(o=>o.status==="pending");
  const active = orders.filter(o=>["confirmed","processing","delivering"].includes(o.status));
  const ns = {confirmed:"processing",processing:"delivering",delivering:"done"};
  const nl = {confirmed:"Mulai Proses 🔄",processing:"Kirim 🛵",delivering:"Selesai ✅"};
  const sl = {confirmed:"✅ Diterima",processing:"🔄 Diproses",delivering:"🛵 Diantar"};

  if(al||loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5"}}><div style={{fontSize:"48px"}}>🏪</div></div>;
  if(chatOrder) return <ChatRoom pesananId={chatOrder.pesananId||chatOrder.id} tokoNama={chatOrder.tokoNama||store?.nama} pembeliNama={chatOrder.pembeliNama} onClose={()=>setChatOrder(null)} />;

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>
      {/* Notif */}
      {showNotif && <NotifPanel onClose={()=>setShowNotif(false)} />}
      {/* Chat List */}
      {showChatList && <ChatList onOpenChat={(c)=>{setShowChatList(false);setChatOrder(c);}} onClose={()=>setShowChatList(false)} />}

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#f59e0b,#ea580c)", padding:"20px 20px 28px", borderRadius:"0 0 24px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.7)" }}>🏪 {store?.nama}</p>
            <h1 style={{ fontSize:"22px", fontWeight:900, color:"white", marginTop:"2px" }}>Dashboard</h1>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={()=>setShowNotif(true)} style={{ width:"40px", height:"40px", borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", fontSize:"18px", position:"relative" }}>
              🔔
              {pending.length > 0 && <div style={{ position:"absolute", top:"-2px", right:"-2px", width:"18px", height:"18px", borderRadius:"50%", background:"#ef4444", color:"white", fontSize:"10px", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{pending.length}</div>}
            </button>
            <button onClick={()=>setShowChatList(true)} style={{ width:"40px", height:"40px", borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", fontSize:"18px" }}>💬</button>
            <button onClick={toggleStore} style={{ padding:"8px 14px", borderRadius:"50px", background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px" }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: store?.isOpen ? "#4ade80" : "#f87171" }}></div>
              <span style={{ fontSize:"12px", fontWeight:600, color:"white" }}>{store?.isOpen ? "Buka" : "Tutup"}</span>
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
          <div style={{ flex:1, background:"rgba(255,255,255,0.15)", borderRadius:"14px", padding:"14px" }}>
            <div style={{ fontSize:"24px", fontWeight:900, color:"white" }}>{stats.today}</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.7)" }}>📦 Pesanan</div>
          </div>
          <div style={{ flex:1, background:"rgba(255,255,255,0.15)", borderRadius:"14px", padding:"14px" }}>
            <div style={{ fontSize:"20px", fontWeight:900, color:"white" }}>Rp {stats.revenue>=1000?Math.round(stats.revenue/1000)+"K":stats.revenue}</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.7)" }}>💰 Pendapatan</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding:"16px 20px 0", display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"8px" }}>
        {[
          {icon:"📦",label:"Produk",path:"/seller/produk"},
          {icon:"📋",label:"Pesanan",path:"/seller/pesanan"},
          {icon:"⚙️",label:"Edit Toko",path:"/seller/toko-setting"},
          {icon:"👤",label:"Profil",path:"/seller/profil"},
        ].map(a => (
          <button key={a.label} onClick={()=>router.push(a.path)} style={{
            padding:"12px 4px", borderRadius:"14px", background:"white",
            border:"none", cursor:"pointer", textAlign:"center",
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize:"22px", marginBottom:"4px" }}>{a.icon}</div>
            <div style={{ fontSize:"11px", fontWeight:600, color:"#374151" }}>{a.label}</div>
          </button>
        ))}
      </div>

      {/* Pending */}
      {pending.length>0 && (
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <h3 style={{ fontSize:"16px", fontWeight:800 }}>🔔 Pesanan Masuk</h3>
            <span style={{ padding:"4px 12px", borderRadius:"20px", background:"#fef2f2", color:"#ef4444", fontSize:"12px", fontWeight:700 }}>{pending.length} baru</span>
          </div>
          {pending.map(o => (
            <div key={o.id} style={{ background:"white", borderRadius:"16px", padding:"16px", marginBottom:"10px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", borderLeft:"4px solid #f59e0b" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center" }}>👤</div>
                  <div><h4 style={{ fontSize:"14px", fontWeight:700 }}>{o.pembeliNama}</h4><p style={{ fontSize:"11px", color:"#9ca3af" }}>{o.pembeliAlamat||"-"}</p></div>
                </div>
                <span style={{ fontSize:"11px", color:"#9ca3af" }}>{new Date(o.createdAt).toLocaleTimeString("id",{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
              <div style={{ background:"#f9fafb", borderRadius:"10px", padding:"10px", marginBottom:"10px" }}>
                {o.items?.map((it,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", padding:"2px 0" }}><span>{it.nama} x{it.qty}</span><span style={{color:"#6b7280"}}>Rp {(it.harga*it.qty).toLocaleString("id")}</span></div>)}
              </div>
              {o.catatan && <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"8px", background:"#fffbeb", padding:"8px 10px", borderRadius:"8px" }}>📝 {o.catatan}</p>}
              <div style={{ fontSize:"18px", fontWeight:800, color:"#f59e0b", marginBottom:"12px" }}>Rp {(o.totalHarga||0).toLocaleString("id")}</div>
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={()=>updateStatus(o.id,"cancelled")} style={{ flex:1, padding:"12px", borderRadius:"12px", background:"#f3f4f6", color:"#6b7280", border:"none", fontWeight:600, cursor:"pointer" }}>✗ Tolak</button>
                <button onClick={()=>updateStatus(o.id,"confirmed")} style={{ flex:2, padding:"12px", borderRadius:"12px", background:"linear-gradient(135deg,#10b981,#059669)", color:"white", border:"none", fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(16,185,129,0.3)" }}>✓ Terima</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active */}
      {active.length>0 && (
        <div style={{ padding:"16px 20px 0" }}>
          <h3 style={{ fontSize:"16px", fontWeight:800, marginBottom:"12px" }}>🔄 Pesanan Aktif</h3>
          {active.map(o => (
            <div key={o.id} style={{ background:"white", borderRadius:"16px", padding:"14px", marginBottom:"10px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>👤</div>
                  <span style={{ fontSize:"14px", fontWeight:600 }}>{o.pembeliNama}</span>
                </div>
                <span style={{ fontSize:"11px", padding:"4px 10px", borderRadius:"20px", fontWeight:600,
                  background: o.status==="confirmed"?"#dbeafe":o.status==="processing"?"#fef3c7":"#e0e7ff",
                  color: o.status==="confirmed"?"#2563eb":o.status==="processing"?"#d97706":"#7c3aed",
                }}>{sl[o.status]||o.status}</span>
              </div>
              <p style={{ fontSize:"13px", color:"#6b7280", marginBottom:"10px" }}>{o.items?.map(i=>i.nama+" x"+i.qty).join(", ")}</p>
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={()=>setChatOrder(o)} style={{ padding:"10px 14px", borderRadius:"12px", background:"white", border:"2px solid #e5e7eb", color:"#374151", fontWeight:600, fontSize:"13px", cursor:"pointer" }}>💬</button>
                {ns[o.status] && <button onClick={()=>updateStatus(o.id,ns[o.status])} style={{ flex:1, padding:"10px", borderRadius:"12px", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", border:"none", fontWeight:700, fontSize:"13px", cursor:"pointer" }}>{nl[o.status]}</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!pending.length && !active.length && (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:"56px", marginBottom:"12px" }}>📭</div>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"#374151" }}>Belum Ada Pesanan</h3>
        </div>
      )}

      <BottomNav role="seller" active="home" />
    </div>
  );
}
`);

// =============================================
// 6. SELLER PRODUK — Tambah Share
// =============================================
// (Sudah ada dari file sebelumnya, kita tambah tombol share saja)
// Baca file yang ada, inject share button
const produkPath = "app/seller/produk/page.js";
if (fs.existsSync(produkPath)) {
  let content = fs.readFileSync(produkPath, "utf-8");
  // Tambah import ShareProduct jika belum ada
  if (!content.includes("ShareProduct")) {
    content = content.replace(
      'import BottomNav from "@/components/BottomNav";',
      'import BottomNav from "@/components/BottomNav";\nimport ShareProduct from "@/components/ShareProduct";'
    );
    // Tambah state
    content = content.replace(
      'const [viewMode, setViewMode]',
      'const [shareProduct, setShareProduct] = useState(null);\n  const [viewMode, setViewMode]'
    );
    // Tambah modal sebelum closing BottomNav
    content = content.replace(
      '<BottomNav role="seller" active="products" />',
      '{shareProduct && <ShareProduct product={shareProduct} tokoNama="" onClose={()=>setShareProduct(null)} />}\n      <BottomNav role="seller" active="products" />'
    );
    // Tambah tombol Share di list view
    content = content.replace(
      "}>✏️ Edit</button>\n                  <button onClick={()=>del(p.id)}",
      '}>✏️ Edit</button>\n                  <button onClick={()=>setShareProduct(p)} style={{ flex:1, padding:"8px", borderRadius:"10px", background:"#dbeafe", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:"#2563eb" }}>📤 Share</button>\n                  <button onClick={()=>del(p.id)}'
    );
    fs.writeFileSync(produkPath, content);
    console.log("  ✅ " + produkPath + " (updated with Share)");
  }
}

// =============================================
// 7. BUYER HOME — Tambah Notif + Chat List
// =============================================
const buyerHomePath = "app/buyer/page.js";
if (fs.existsSync(buyerHomePath)) {
  let content = fs.readFileSync(buyerHomePath, "utf-8");
  if (!content.includes("NotifPanel")) {
    content = content.replace(
      'import BottomNav from "@/components/BottomNav";',
      'import BottomNav from "@/components/BottomNav";\nimport NotifPanel from "@/components/NotifPanel";\nimport ChatList from "@/components/ChatList";\nimport ChatRoom from "@/components/ChatRoom";'
    );
    content = content.replace(
      'const [sortBy, setSortBy]',
      'const [showNotif, setShowNotif] = useState(false);\n  const [showChatList, setShowChatList] = useState(false);\n  const [chatOrder, setChatOrder] = useState(null);\n  const [sortBy, setSortBy]'
    );
    // Tambah modals sebelum return utama
    content = content.replace(
      '{/* ===== HEADER ===== */}',
      '{showNotif && <NotifPanel onClose={()=>setShowNotif(false)} />}\n      {showChatList && <ChatList onOpenChat={(c)=>{setShowChatList(false);setChatOrder(c);}} onClose={()=>setShowChatList(false)} />}\n      {chatOrder && <ChatRoom pesananId={chatOrder.pesananId||chatOrder.id} tokoNama={chatOrder.tokoNama} pembeliNama={chatOrder.pembeliNama} onClose={()=>setChatOrder(null)} />}\n\n      {/* ===== HEADER ===== */}'
    );
    // Update header buttons
    content = content.replace(
      '}>📋</button>',
      '}>📋</button>\n            <button onClick={()=>setShowChatList(true)} style={{ width:"40px", height:"40px", borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"none", fontSize:"18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>💬</button>\n            <button onClick={()=>setShowNotif(true)} style={{ width:"40px", height:"40px", borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"none", fontSize:"18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>🔔</button>'
    );
    fs.writeFileSync(buyerHomePath, content);
    console.log("  ✅ " + buyerHomePath + " (updated with Notif + Chat)");
  }
}

// =============================================
// 8. Update status labels di pesanan
// =============================================
const sellerPesananPath = "app/seller/pesanan/page.js";
if (fs.existsSync(sellerPesananPath)) {
  let content = fs.readFileSync(sellerPesananPath, "utf-8");
  content = content.replace('cooking:{l:"🍳 Dimasak"', 'processing:{l:"🔄 Diproses"');
  content = content.replace('"cooking"', '"processing"');
  content = content.replace('{id:"cooking",l:"Dimasak"}', '{id:"processing",l:"Diproses"}');
  fs.writeFileSync(sellerPesananPath, content);
  console.log("  ✅ " + sellerPesananPath + " (status updated)");
}

const buyerPesananPath = "app/buyer/pesanan/page.js";
if (fs.existsSync(buyerPesananPath)) {
  let content = fs.readFileSync(buyerPesananPath, "utf-8");
  content = content.replace('cooking:{l:"🍳 Dimasak"', 'processing:{l:"🔄 Diproses"');
  fs.writeFileSync(buyerPesananPath, content);
  console.log("  ✅ " + buyerPesananPath + " (status updated)");
}

console.log("");
console.log("🎉 ========================================");
console.log("   5 FITUR BARU SELESAI!");
console.log("========================================");
console.log("");
console.log("   1. ✅ Edit Toko — nama, ikon, deskripsi, jam, GPS");
console.log("   2. ✅ Status 'Diproses' (bukan 'Dimasak')");
console.log("   3. ✅ Share produk ke WA, Telegram, FB, Twitter");
console.log("   4. ✅ Chat List — riwayat chat, bisa chat ulang");
console.log("   5. ✅ Notifikasi panel — semua update pesanan");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Deploy:  git add . && git commit -m '5 fitur baru' && git push");
console.log("");
