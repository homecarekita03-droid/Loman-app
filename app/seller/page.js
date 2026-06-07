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
                <div style={{ fontSize: "14px", color: "#4b5563", marginBottom: "8px", lineHeight: 1.8 }}>{o.items?.map(i => "• " + i.nama + " x" + i.qty).join("\n")}</div>
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
