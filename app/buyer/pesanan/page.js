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
