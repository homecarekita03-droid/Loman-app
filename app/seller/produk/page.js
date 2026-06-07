"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

const emojis = ["🍚","🍜","🍗","🥘","🧁","🍰","🥤","☕","🧃","👕","🧴","📦","🌿","🍳","🥗","🍲"];

export default function KelolaProduk() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [storeId, setStoreId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama:"", harga:"", deskripsi:"", emoji:"🍚", kategori:"makanan" });

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        if(!sq.empty) { const sid=sq.docs[0].id; setStoreId(sid);
          const pq = await getDocs(query(collection(db,"produk"),where("tokoId","==",sid)));
          setProducts(pq.docs.map(d=>({id:d.id,...d.data()}))); }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  async function submit(e) {
    e.preventDefault(); if(!storeId||!form.nama.trim()||!form.harga) return;
    const d = { tokoId:storeId, nama:form.nama.trim(), harga:parseInt(form.harga), deskripsi:form.deskripsi, emoji:form.emoji, kategori:form.kategori, tersedia:true };
    try {
      if(editId) { await updateDoc(doc(db,"produk",editId),d); setProducts(p=>p.map(x=>x.id===editId?{...x,...d}:x)); }
      else { const nd = await addDoc(collection(db,"produk"),d); setProducts(p=>[...p,{id:nd.id,...d}]); }
      reset();
    } catch(e){ alert("Gagal simpan."); }
  }

  function reset() { setForm({nama:"",harga:"",deskripsi:"",emoji:"🍚",kategori:"makanan"}); setEditId(null); setShowForm(false); }
  function edit(p) { setForm({nama:p.nama,harga:String(p.harga),deskripsi:p.deskripsi||"",emoji:p.emoji||"🍚",kategori:p.kategori||"makanan"}); setEditId(p.id); setShowForm(true); }
  async function del(id) { if(!confirm("Hapus?")) return; await deleteDoc(doc(db,"produk",id)); setProducts(p=>p.filter(x=>x.id!==id)); }
  async function toggle(id,c) { await updateDoc(doc(db,"produk",id),{tersedia:!c}); setProducts(p=>p.map(x=>x.id===id?{...x,tersedia:!c}:x)); }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black">📦 Produk</h1>
        <button onClick={()=>{reset();setShowForm(true);}} className="px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>+ Tambah</button>
      </div>
      {showForm && <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-white w-full max-w-[480px] rounded-t-3xl p-6" style={{animation:"slideUp 0.3s ease"}}>
          <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{editId?"Edit":"Tambah"} Produk</h3><button onClick={reset} className="text-gray-400 text-xl">✕</button></div>
          <form onSubmit={submit} className="space-y-4">
            <div><label className="text-sm font-medium text-gray-600 mb-2 block">Emoji</label><div className="flex flex-wrap gap-2">{emojis.map(e=><button key={e} type="button" onClick={()=>setForm(f=>({...f,emoji:e}))} className={"w-10 h-10 rounded-xl text-xl flex items-center justify-center "+(form.emoji===e?"bg-amber-100 ring-2 ring-amber-400":"bg-gray-100")}>{e}</button>)}</div></div>
            <div><label className="text-sm font-medium text-gray-600 mb-1 block">Nama</label><input required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} placeholder="Nasi Goreng Spesial" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" /></div>
            <div><label className="text-sm font-medium text-gray-600 mb-1 block">Harga (Rp)</label><input type="number" required value={form.harga} onChange={e=>setForm(f=>({...f,harga:e.target.value}))} placeholder="15000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" /></div>
            <div><label className="text-sm font-medium text-gray-600 mb-1 block">Kategori</label><select value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"><option value="makanan">🍚 Makanan</option><option value="kue">🧁 Kue</option><option value="minuman">🥤 Minuman</option><option value="laundry">👕 Laundry</option><option value="kebutuhan">🧴 Kebutuhan</option><option value="lainnya">📦 Lainnya</option></select></div>
            <div><label className="text-sm font-medium text-gray-600 mb-1 block">Deskripsi</label><textarea value={form.deskripsi} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))} placeholder="Opsional..." rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none" /></div>
            <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>{editId?"💾 Simpan":"✅ Tambah"}</button>
          </form></div></div>}
      <div className="px-5 py-4 space-y-3">
        {loading ? [1,2,3].map(i=><div key={i} className="bg-white rounded-2xl p-4"><div className="h-4 w-3/4 skeleton mb-2"></div><div className="h-3 w-1/2 skeleton"></div></div>)
        : products.length===0 ? <div className="text-center py-16"><div className="text-5xl mb-3">📦</div><h3 className="text-lg font-bold text-gray-700">Belum Ada Produk</h3></div>
        : products.map(p=>(
          <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">{p.emoji||"📦"}</div>
            <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold truncate">{p.nama}</h4><p className="text-sm font-bold" style={{color:"#f59e0b"}}>Rp {(p.harga||0).toLocaleString("id")}</p></div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={()=>edit(p)} className="text-xs text-blue-500 font-semibold">Edit</button>
              <button onClick={()=>del(p.id)} className="text-xs text-red-400 font-semibold">Hapus</button>
              <button onClick={()=>toggle(p.id,p.tersedia)} className={"w-10 h-6 rounded-full relative transition-colors "+(p.tersedia!==false?"bg-green-500":"bg-gray-300")}><div className={"w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-transform "+(p.tersedia!==false?"translate-x-5":"translate-x-1")}></div></button>
            </div>
          </div>))}
      </div>
      <BottomNav role="seller" active="products" />
    </div>
  );
}
