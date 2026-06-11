"use client";
import { sendWA, notifTemplates } from "../../lib/waNotif";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import { notifPesananDiterima, notifPesananDikirim, notifPesananSelesai } from "@/lib/waNotif";
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
  async function updateStatus(id, s) {
    await updateDoc(doc(db,"pesanan",id), {status:s});
    setOrders(function(p) { return p.map(function(o) { return o.id===id ? {...o, status:s} : o; }); });
    var order = orders.find(function(o) { return o.id === id; });
    if (order && order.pembeliPhone) {
      var tName = store ? store.nama : "Toko";
      var waUrl = null;
      if (s === "confirmed") waUrl = notifPesananDiterima(order.pembeliPhone, tName);
      if (s === "delivering") waUrl = notifPesananDikirim(order.pembeliPhone, tName);
      if (s === "done") waUrl = notifPesananSelesai(order.pembeliPhone, tName);
      if (waUrl) window.open(waUrl, "_blank");
    }
  }

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
      <div style={{ padding:"16px 20px 0", display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"8px" }}>
        {[
          {icon:"📦",label:"Produk",path:"/seller/produk"},
          {icon:"📋",label:"Pesanan",path:"/seller/pesanan"},
          {icon:"📊",label:"Laporan",path:"/seller/laporan"},
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


