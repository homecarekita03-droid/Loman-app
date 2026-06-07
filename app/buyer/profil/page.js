"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

export default function ProfilPage() {
  const router = useRouter();
  const { user, userData, setUserData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nama: userData?.nama||"", phone: userData?.phone||"", alamat: userData?.alamat||"", perumahan: userData?.perumahan||"" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if(!user)return; setSaving(true);
    try { await updateDoc(doc(db,"users",user.uid),form); setUserData(p=>({...p,...form})); setEditing(false); } catch(e){alert("Gagal.");}
    setSaving(false);
  }
  async function logout() { if(confirm("Yakin keluar?")) { await signOut(auth); router.push("/"); } }
  async function switchRole() {
    if(!user)return; const nr = userData?.role==="seller"?"buyer":"seller";
    try { await updateDoc(doc(db,"users",user.uid),{role:nr}); setUserData(p=>({...p,role:nr})); router.push(nr==="seller"?"/seller":"/buyer"); } catch(e){console.error(e);}
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 page-transition">
      <div className="bg-white border-b border-gray-100 px-5 py-4"><h1 className="text-xl font-black text-gray-800">👤 Profil</h1></div>
      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center mb-4">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl" style={{background:"linear-gradient(135deg,#fef3c7,#fde68a)"}}>
            {user?.photoURL ? <img src={user.photoURL} alt="" className="w-20 h-20 rounded-full object-cover" /> : "👤"}
          </div>
          <h2 className="text-lg font-bold">{userData?.nama||"User"}</h2>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">{userData?.role==="seller"?"🏪 Penjual":"🛒 Pembeli"}</span>
        </div>
        {editing ? (<div className="space-y-3">
          {[{l:"Nama",k:"nama",p:"Nama lengkap"},{l:"No. HP",k:"phone",p:"08xxx"},{l:"Alamat",k:"alamat",p:"Blok A No.15"},{l:"Perumahan",k:"perumahan",p:"Griya Indah"}].map(f=>(
            <div key={f.k} className="bg-white rounded-2xl p-4 shadow-sm"><label className="text-xs text-gray-400 mb-1 block">{f.l}</label>
              <input value={form[f.k]} onChange={e=>setForm(prev=>({...prev,[f.k]:e.target.value}))} placeholder={f.p} className="w-full text-sm font-semibold border-b border-gray-200 pb-1 focus:outline-none focus:border-amber-400" /></div>))}
          <div className="flex gap-3 pt-2"><button onClick={()=>setEditing(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold">Batal</button>
            <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-50" style={{background:"linear-gradient(135deg,#f59e0b,#ea580c)"}}>{saving?"Menyimpan...":"💾 Simpan"}</button></div>
        </div>) : (<div className="space-y-3">
          {[{l:"Nama",v:userData?.nama,i:"👤"},{l:"No. HP",v:userData?.phone||"Belum diisi",i:"📱"},{l:"Alamat",v:userData?.alamat||"Belum diisi",i:"🏠"},{l:"Perumahan",v:userData?.perumahan||"Belum diisi",i:"📍"}].map(f=>(
            <div key={f.l} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"><span className="text-xl">{f.i}</span><div><p className="text-xs text-gray-400">{f.l}</p><p className="text-sm font-semibold">{f.v}</p></div></div>))}
          <button onClick={()=>setEditing(true)} className="w-full py-3 rounded-xl border-2 border-amber-400 text-amber-600 font-semibold mt-2">✏️ Edit Profil</button>
        </div>)}
        <div className="pt-4 space-y-3">
          <button onClick={switchRole} className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm">🔄 Ganti ke {userData?.role==="seller"?"Pembeli":"Penjual"}</button>
          <button onClick={logout} className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-semibold">🚪 Keluar</button>
        </div>
      </div>
      <BottomNav role={userData?.role||"buyer"} active="profile" />
    </div>
  );
}
