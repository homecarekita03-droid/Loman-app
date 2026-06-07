"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

const sb = {
  pending:{l:"⏳ Menunggu",bg:"#f3f4f6",c:"#4b5563"},
  confirmed:{l:"✅ Diterima",bg:"#dbeafe",c:"#2563eb"},
  processing:{l:"🔄 Diproses",bg:"#fef3c7",c:"#d97706"},
  delivering:{l:"🛵 Diantar",bg:"#e0e7ff",c:"#7c3aed"},
  done:{l:"✅ Selesai",bg:"#d1fae5",c:"#059669"},
  cancelled:{l:"❌ Batal",bg:"#fee2e2",c:"#dc2626"},
};

export default function SellerPesanan() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        if(!sq.empty) { const os = await getDocs(query(collection(db,"pesanan"),where("tokoId","==",sq.docs[0].id)));
          setOrders(os.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  const fil = filter==="all" ? orders : orders.filter(o=>o.status===filter);

  const filters = [
    {id:"all",l:"Semua",count:orders.length},
    {id:"pending",l:"Baru",count:orders.filter(o=>o.status==="pending").length},
    {id:"confirmed",l:"Diterima",count:orders.filter(o=>o.status==="confirmed").length},
    {id:"processing",l:"Dimasak",count:orders.filter(o=>o.status==="cooking").length},
    {id:"done",l:"Selesai",count:orders.filter(o=>o.status==="done").length},
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>
      {/* Header */}
      <div style={{ background:"white", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:"12px" }}>
        <button onClick={()=>router.push("/seller")} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <h1 style={{ fontSize:"18px", fontWeight:900, color:"#1f2937" }}>Riwayat Pesanan</h1>
      </div>

      {/* Filter Tabs */}
      <div style={{ padding:"12px 20px", display:"flex", gap:"8px", overflowX:"auto", background:"white", borderBottom:"1px solid #f3f4f6" }} className="no-scrollbar">
        {filters.map(f => (
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{
            padding:"8px 16px", borderRadius:"20px", border:"none",
            fontSize:"13px", fontWeight:600, cursor:"pointer",
            whiteSpace:"nowrap", flexShrink:0, transition:"all 0.2s",
            background: filter===f.id ? "linear-gradient(135deg, #f59e0b, #ea580c)" : "#f3f4f6",
            color: filter===f.id ? "white" : "#6b7280",
          }}>
            {f.l} {f.count > 0 && <span style={{
              marginLeft:"4px", padding:"1px 6px", borderRadius:"10px",
              background: filter===f.id ? "rgba(255,255,255,0.3)" : "#e5e7eb",
              fontSize:"11px",
            }}>{f.count}</span>}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div style={{ padding:"12px 20px", display:"flex", flexDirection:"column", gap:"10px" }}>
        {loading ? [1,2,3].map(i => <div key={i} style={{ background:"white", borderRadius:"14px", padding:"16px" }}><div className="skeleton" style={{ height:"60px" }}></div></div>)
        : fil.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:"56px", marginBottom:"12px" }}>📭</div>
            <p style={{ color:"#9ca3af", fontSize:"14px" }}>Tidak ada pesanan</p>
          </div>
        ) : fil.map(o => {
          const s = sb[o.status] || sb.pending;
          return (
            <div key={o.id} style={{
              background:"white", borderRadius:"16px", padding:"14px",
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                <div>
                  <p style={{ fontSize:"11px", color:"#9ca3af", fontFamily:"monospace" }}>#{o.id.slice(-8).toUpperCase()}</p>
                  <h4 style={{ fontSize:"15px", fontWeight:700, color:"#1f2937", marginTop:"2px" }}>👤 {o.pembeliNama}</h4>
                </div>
                <span style={{ padding:"4px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:600, background:s.bg, color:s.c }}>{s.l}</span>
              </div>
              <div style={{ background:"#f9fafb", borderRadius:"10px", padding:"8px 12px", marginBottom:"8px" }}>
                {o.items?.map((item,idx) => (
                  <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:"#374151", padding:"2px 0" }}>
                    <span>{item.nama} x{item.qty}</span>
                    <span style={{color:"#6b7280"}}>Rp {(item.harga*item.qty).toLocaleString("id")}</span>
                  </div>
                ))}
              </div>
              {o.catatan && <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"6px" }}>📝 {o.catatan}</p>}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px", borderTop:"1px solid #f3f4f6" }}>
                <span style={{ fontWeight:800, color:"#f59e0b", fontSize:"15px" }}>Rp {(o.totalHarga||0).toLocaleString("id")}</span>
                <span style={{ fontSize:"11px", color:"#9ca3af" }}>{new Date(o.createdAt).toLocaleDateString("id",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav role="seller" active="orders" />
    </div>
  );
}
