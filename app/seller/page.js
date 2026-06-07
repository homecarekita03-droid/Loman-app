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

  if (al||loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5"}}><div style={{textAlign:"center"}}><div style={{fontSize:"48px",marginBottom:"8px"}}>🏪</div><p style={{color:"#9ca3af"}}>Memuat...</p></div></div>;

  if (chatOrder) return <ChatRoom pesananId={chatOrder.id} tokoId={chatOrder.tokoId} tokoNama={chatOrder.tokoNama||store?.nama} pembeliNama={chatOrder.pembeliNama} onClose={()=>setChatOrder(null)} />;

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>

      {/* ===== HEADER ===== */}
      <div style={{
        background:"linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
        padding:"20px 20px 28px", borderRadius:"0 0 24px 24px",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.7)" }}>🏪 Toko Anda</p>
            <h1 style={{ fontSize:"22px", fontWeight:900, color:"white", marginTop:"2px" }}>{store?.nama}</h1>
          </div>
          <button onClick={toggleStore} style={{
            display:"flex", alignItems:"center", gap:"8px",
            padding:"8px 16px", borderRadius:"50px",
            background: store?.isOpen ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            border:"none", cursor:"pointer",
          }}>
            <div style={{
              width:"10px", height:"10px", borderRadius:"50%",
              background: store?.isOpen ? "#4ade80" : "#f87171",
              boxShadow: store?.isOpen ? "0 0 8px #4ade80" : "0 0 8px #f87171",
            }}></div>
            <span style={{ fontSize:"13px", fontWeight:600, color:"white" }}>
              {store?.isOpen ? "Buka" : "Tutup"}
            </span>
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
          <div style={{ flex:1, background:"rgba(255,255,255,0.15)", borderRadius:"14px", padding:"14px", backdropFilter:"blur(4px)" }}>
            <div style={{ fontSize:"24px", fontWeight:900, color:"white" }}>{stats.today}</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.7)", marginTop:"2px" }}>📦 Pesanan Hari Ini</div>
          </div>
          <div style={{ flex:1, background:"rgba(255,255,255,0.15)", borderRadius:"14px", padding:"14px", backdropFilter:"blur(4px)" }}>
            <div style={{ fontSize:"20px", fontWeight:900, color:"white" }}>Rp {stats.revenue>=1000?Math.round(stats.revenue/1000)+"K":stats.revenue}</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.7)", marginTop:"2px" }}>💰 Pendapatan</div>
          </div>
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div style={{ padding:"16px 20px 0", display:"flex", gap:"10px" }}>
        <button onClick={()=>router.push("/seller/produk")} style={{
          flex:1, padding:"14px", borderRadius:"14px", background:"white",
          border:"none", cursor:"pointer", textAlign:"center",
          boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize:"24px", marginBottom:"4px" }}>📦</div>
          <div style={{ fontSize:"12px", fontWeight:600, color:"#374151" }}>Kelola Produk</div>
        </button>
        <button onClick={()=>router.push("/seller/pesanan")} style={{
          flex:1, padding:"14px", borderRadius:"14px", background:"white",
          border:"none", cursor:"pointer", textAlign:"center",
          boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize:"24px", marginBottom:"4px" }}>📋</div>
          <div style={{ fontSize:"12px", fontWeight:600, color:"#374151" }}>Semua Pesanan</div>
        </button>
        <button onClick={()=>router.push("/seller/profil")} style={{
          flex:1, padding:"14px", borderRadius:"14px", background:"white",
          border:"none", cursor:"pointer", textAlign:"center",
          boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize:"24px", marginBottom:"4px" }}>⚙️</div>
          <div style={{ fontSize:"12px", fontWeight:600, color:"#374151" }}>Pengaturan</div>
        </button>
      </div>

      {/* ===== PENDING ORDERS ===== */}
      {pending.length > 0 && (
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <h3 style={{ fontSize:"16px", fontWeight:800, color:"#1f2937" }}>🔔 Pesanan Masuk</h3>
            <span style={{ padding:"4px 12px", borderRadius:"20px", background:"#fef2f2", color:"#ef4444", fontSize:"12px", fontWeight:700 }}>{pending.length} baru</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {pending.map(o => (
              <div key={o.id} style={{
                background:"white", borderRadius:"16px", padding:"16px",
                boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                borderLeft:"4px solid #f59e0b",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>👤</div>
                    <div>
                      <h4 style={{ fontSize:"14px", fontWeight:700, color:"#1f2937" }}>{o.pembeliNama}</h4>
                      <p style={{ fontSize:"11px", color:"#9ca3af" }}>{o.pembeliAlamat || "Alamat belum diisi"}</p>
                    </div>
                  </div>
                  <span style={{ fontSize:"11px", color:"#9ca3af" }}>{new Date(o.createdAt).toLocaleTimeString("id",{hour:"2-digit",minute:"2-digit"})}</span>
                </div>

                <div style={{ background:"#f9fafb", borderRadius:"10px", padding:"10px 12px", marginBottom:"10px" }}>
                  {o.items?.map((item,idx) => (
                    <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:"#374151", padding:"3px 0" }}>
                      <span>{item.nama} x{item.qty}</span>
                      <span style={{ color:"#6b7280" }}>Rp {(item.harga*item.qty).toLocaleString("id")}</span>
                    </div>
                  ))}
                </div>

                {o.catatan && <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"10px", padding:"8px 10px", background:"#fffbeb", borderRadius:"8px" }}>📝 {o.catatan}</p>}

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <span style={{ fontSize:"18px", fontWeight:800, color:"#f59e0b" }}>Rp {(o.totalHarga||0).toLocaleString("id")}</span>
                  <span style={{ fontSize:"12px", color:"#6b7280" }}>💵 COD</span>
                </div>

                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={()=>updateStatus(o.id,"cancelled")} style={{
                    flex:1, padding:"12px", borderRadius:"12px", background:"#f3f4f6",
                    color:"#6b7280", border:"none", fontWeight:600, fontSize:"14px", cursor:"pointer",
                  }}>✗ Tolak</button>
                  <button onClick={()=>updateStatus(o.id,"confirmed")} style={{
                    flex:2, padding:"12px", borderRadius:"12px",
                    background:"linear-gradient(135deg, #10b981, #059669)",
                    color:"white", border:"none", fontWeight:700, fontSize:"14px", cursor:"pointer",
                    boxShadow:"0 4px 12px rgba(16,185,129,0.3)",
                  }}>✓ Terima Pesanan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ACTIVE ORDERS ===== */}
      {active.length > 0 && (
        <div style={{ padding:"20px 20px 0" }}>
          <h3 style={{ fontSize:"16px", fontWeight:800, color:"#1f2937", marginBottom:"12px" }}>🍳 Pesanan Aktif</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {active.map(o => (
              <div key={o.id} style={{
                background:"white", borderRadius:"16px", padding:"14px",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>👤</div>
                    <span style={{ fontSize:"14px", fontWeight:600, color:"#1f2937" }}>{o.pembeliNama}</span>
                  </div>
                  <span style={{
                    fontSize:"11px", padding:"4px 10px", borderRadius:"20px", fontWeight:600,
                    background: o.status==="confirmed"?"#dbeafe":o.status==="cooking"?"#fef3c7":"#e0e7ff",
                    color: o.status==="confirmed"?"#2563eb":o.status==="cooking"?"#d97706":"#7c3aed",
                  }}>{o.status==="confirmed"?"✅ Diterima":o.status==="cooking"?"🍳 Dimasak":"🛵 Diantar"}</span>
                </div>
                <p style={{ fontSize:"13px", color:"#6b7280", marginBottom:"10px" }}>{o.items?.map(i=>i.nama+" x"+i.qty).join(", ")}</p>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={()=>setChatOrder(o)} style={{
                    padding:"10px 16px", borderRadius:"12px", background:"white",
                    border:"2px solid #e5e7eb", color:"#374151", fontWeight:600,
                    fontSize:"13px", cursor:"pointer",
                  }}>💬</button>
                  {ns[o.status] && <button onClick={()=>updateStatus(o.id,ns[o.status])} style={{
                    flex:1, padding:"10px", borderRadius:"12px",
                    background:"linear-gradient(135deg, #f59e0b, #ea580c)",
                    color:"white", border:"none", fontWeight:700, fontSize:"13px", cursor:"pointer",
                  }}>{nl[o.status]}</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!pending.length && !active.length && (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:"56px", marginBottom:"12px" }}>📭</div>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"#374151" }}>Belum Ada Pesanan</h3>
          <p style={{ fontSize:"13px", color:"#9ca3af", marginTop:"4px" }}>Pesanan dari pembeli akan muncul di sini</p>
        </div>
      )}

      <BottomNav role="seller" active="home" />
    </div>
  );
}
