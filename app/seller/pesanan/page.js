"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

const sb = { pending:{l:"⏳ Menunggu",c:"bg-gray-100 text-gray-600"}, confirmed:{l:"✅ Diterima",c:"bg-blue-50 text-blue-600"}, cooking:{l:"🍳 Dimasak",c:"bg-amber-50 text-amber-700"}, delivering:{l:"🛵 Diantar",c:"bg-purple-50 text-purple-600"}, done:{l:"✅ Selesai",c:"bg-green-50 text-green-600"}, cancelled:{l:"❌ Batal",c:"bg-red-50 text-red-600"} };

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

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4"><h1 className="text-xl font-black">📋 Semua Pesanan</h1></div>
      <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {[{id:"all",l:"Semua"},{id:"pending",l:"Menunggu"},{id:"confirmed",l:"Diterima"},{id:"cooking",l:"Dimasak"},{id:"done",l:"Selesai"}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} className={"px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 "+(filter===f.id?"bg-amber-500 text-white":"bg-gray-100 text-gray-600")}>{f.l}</button>))}
      </div>
      <div className="px-5 space-y-3">
        {loading ? [1,2,3].map(i=><div key={i} className="bg-white rounded-2xl p-4"><div className="h-16 skeleton"></div></div>)
        : fil.length===0 ? <div className="text-center py-16"><div className="text-5xl mb-3">📭</div><p className="text-gray-400">Tidak ada pesanan</p></div>
        : fil.map(o=>{const s=sb[o.status]||sb.pending; return(
          <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2"><div><p className="text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</p><h4 className="font-bold">👤 {o.pembeliNama}</h4></div><span className={"px-3 py-1 rounded-full text-xs font-semibold "+s.c}>{s.l}</span></div>
            <p className="text-sm text-gray-500">{o.items?.map(i=>i.nama+" x"+i.qty).join(", ")}</p>
            {o.catatan&&<p className="text-xs text-gray-400 mt-1">📝 {o.catatan}</p>}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100"><span className="font-bold" style={{color:"#f59e0b"}}>Rp {(o.totalHarga||0).toLocaleString("id")}</span><span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("id",{day:"numeric",month:"short"})}</span></div>
          </div>);})}
      </div>
      <BottomNav role="seller" active="orders" />
    </div>
  );
}
