"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import ChatRoom from "@/components/ChatRoom";
import RatingSimpel from "@/components/RatingSimpel";

const sc = {
  pending:{l:"⏳ Menunggu",bg:"#f3f4f6",c:"#4b5563"},
  confirmed:{l:"✅ Diterima",bg:"#dbeafe",c:"#2563eb"},
  processing:{l:"🔄 Diproses",bg:"#fef3c7",c:"#d97706"},
  delivering:{l:"🛵 Diantar",bg:"#e0e7ff",c:"#7c3aed"},
  done:{l:"✅ Selesai",bg:"#d1fae5",c:"#059669"},
  cancelled:{l:"❌ Batal",bg:"#fee2e2",c:"#dc2626"},
};

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
      try {
        const s = await getDocs(query(collection(db,"pesanan"),where("pembeliId","==",user.uid)));
        setOrders(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  function ft(iso) {
    if(!iso)return"";
    const d=new Date(iso), n=new Date(), m=Math.floor((n-d)/60000);
    if(m<1)return"Baru saja"; if(m<60)return m+" mnt lalu";
    if(m<1440)return Math.floor(m/60)+" jam lalu";
    return d.toLocaleDateString("id",{day:"numeric",month:"short"});
  }

  if (chatOrder) return <ChatRoom pesananId={chatOrder.id} tokoNama={chatOrder.tokoNama} pembeliNama={chatOrder.pembeliNama} onClose={()=>setChatOrder(null)} />;

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>
      <div style={{ background:"white", borderBottom:"1px solid #f3f4f6", padding:"16px 20px", display:"flex", alignItems:"center", gap:"12px" }}>
        <button onClick={()=>router.push("/buyer")} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <h1 style={{ fontSize:"18px", fontWeight:900 }}>Pesanan Saya</h1>
      </div>

      {loading ? (
        <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:"10px" }}>
          {[1,2,3].map(i=><div key={i} style={{background:"white",borderRadius:"14px",padding:"16px"}}><div className="skeleton" style={{height:"60px"}}></div></div>)}
        </div>
      ) : orders.length===0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 24px" }}>
          <div style={{ fontSize:"56px", marginBottom:"12px" }}>📋</div>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"#374151" }}>Belum Ada Pesanan</h3>
          <button onClick={()=>router.push("/buyer")} style={{ marginTop:"20px", padding:"12px 28px", borderRadius:"12px", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", border:"none", fontWeight:600, cursor:"pointer" }}>Mulai Belanja</button>
        </div>
      ) : (
        <div style={{ padding:"12px 20px", display:"flex", flexDirection:"column", gap:"10px" }}>
          {orders.map(o => {
            const s = sc[o.status] || sc.pending;
            const canChat = !["cancelled","done"].includes(o.status);
            return (
              <div key={o.id} style={{ background:"white", borderRadius:"16px", padding:"14px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                  <div>
                    <p style={{ fontSize:"11px", color:"#9ca3af", fontFamily:"monospace" }}>#{o.id.slice(-8).toUpperCase()}</p>
                    <h4 style={{ fontSize:"15px", fontWeight:700, color:"#1f2937" }}>{o.tokoNama}</h4>
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

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px", borderTop:"1px solid #f3f4f6" }}>
                  <span style={{ fontWeight:800, color:"#f59e0b", fontSize:"15px" }}>Rp {(o.totalHarga||0).toLocaleString("id")}</span>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                    {canChat && (
                      <button onClick={()=>setChatOrder(o)} style={{
                        padding:"7px 14px", borderRadius:"20px",
                        background:"linear-gradient(135deg,#f59e0b,#ea580c)",
                        color:"white", border:"none", fontSize:"12px",
                        fontWeight:600, cursor:"pointer",
                        display:"flex", alignItems:"center", gap:"4px",
                      }}>💬 Chat</button>
                    )}
                    {o.status === "done" && !o.rating && (
                      <span style={{ fontSize:"11px", color:"#f59e0b", fontWeight:600 }}>⭐ Beri rating</span>
                    )}
                    <span style={{ fontSize:"11px", color:"#9ca3af" }}>{ft(o.createdAt)}</span>
                  </div>
                </div>
                {/* Rating untuk pesanan selesai yang belum di-rating */}
                {o.status === "done" && !o.rating && (
                  <RatingSimpel orderId={o.id} tokoId={o.tokoId} />
                )}
                {/* Tampilkan rating yang sudah diberikan */}
                {o.rating && (
                  <div style={{ marginTop:"8px", display:"flex", alignItems:"center", gap:"4px" }}>
                    <span style={{ fontSize:"12px", color:"#9ca3af" }}>Rating Anda:</span>
                    <span style={{ fontSize:"13px" }}>{"⭐".repeat(o.rating)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BottomNav role="buyer" active="orders" />
    </div>
  );
}



