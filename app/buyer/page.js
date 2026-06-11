"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import NotifButton from "@/components/NotifButton";
import { alertError, alertConfirm } from "@/components/SweetAlert";

export default function ProfilPage() {
  const router = useRouter();
  const { user, userData, setUserData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nama:"", phone:"",
    alamatDetail:"", rt:"", rw:"",
    kelurahan:"", kecamatan:"", kota:"",
    perumahan:"",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) setForm({
      nama:userData.nama||"", phone:userData.phone||"",
      alamatDetail: userData.alamatDetail || userData.alamat || "",
      rt: userData.rt||"", rw: userData.rw||"",
      kelurahan: userData.kelurahan||"", kecamatan: userData.kecamatan||"",
      kota: userData.kota||"", perumahan: userData.perumahan||"",
    });
  }, [userData]);

  function buildAlamat() {
    let parts = [];
    if (form.alamatDetail) parts.push(form.alamatDetail);
    if (form.rt || form.rw) parts.push((form.rt?"RT "+form.rt:"")+(form.rw?" / RW "+form.rw:""));
    if (form.kelurahan) parts.push(form.kelurahan);
    if (form.kecamatan) parts.push("Kec. "+form.kecamatan);
    if (form.kota) parts.push(form.kota);
    return parts.join(", ");
  }

  async function save() {
    if(!user) return; setSaving(true);
    const alamat = buildAlamat();
    const updates = { ...form, alamat };
    try { await updateDoc(doc(db,"users",user.uid),updates); setUserData(p=>({...p,...updates})); setEditing(false); } catch(e){alertError("Gagal", "Tidak bisa menyimpan profil.");}
    setSaving(false);
  }

  async function logout() { if(confirm("Yakin keluar?")) { await signOut(auth); router.push("/"); } }
  async function switchRole() {
    if(!user) return; const nr = userData?.role==="seller"?"buyer":"seller";
    try { await updateDoc(doc(db,"users",user.uid),{role:nr}); setUserData(p=>({...p,role:nr})); router.push(nr==="seller"?"/seller":"/buyer"); } catch(e){console.error(e);}
  }

  const role = userData?.role || "buyer";
  const inputStyle = { width:"100%", padding:"12px 14px", border:"2px solid #e5e7eb", borderRadius:"12px", fontSize:"14px", outline:"none", background:"#f9fafb", transition:"border-color 0.2s" };
  const alamatPreview = buildAlamat();

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>
      <div style={{ background:"linear-gradient(135deg, #f59e0b, #ea580c)", padding:"24px 20px 48px", borderRadius:"0 0 24px 24px", textAlign:"center" }}>
        <h1 style={{ fontSize:"18px", fontWeight:800, color:"white" }}>Profil Saya</h1>
      </div>

      <div style={{ background:"white", borderRadius:"20px", margin:"-32px 20px 0", padding:"24px", textAlign:"center", position:"relative", zIndex:5, boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ width:"80px", height:"80px", borderRadius:"50%", margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"40px", background:"linear-gradient(135deg,#fef3c7,#fde68a)", overflow:"hidden" }}>
          {user?.photoURL ? <img src={user.photoURL} alt="" style={{width:"80px",height:"80px",borderRadius:"50%",objectFit:"cover"}} /> : "👤"}
        </div>
        <h2 style={{ fontSize:"20px", fontWeight:800 }}>{userData?.nama||"User"}</h2>
        <p style={{ fontSize:"13px", color:"#9ca3af" }}>{user?.email}</p>
        <span style={{ display:"inline-block", marginTop:"8px", padding:"4px 16px", borderRadius:"20px", fontSize:"12px", fontWeight:600, background: role==="seller"?"#fef3c7":"#dbeafe", color: role==="seller"?"#d97706":"#2563eb" }}>{role==="seller"?"🏪 Penjual":"🛒 Pembeli"}</span>
      </div>

      <div style={{ padding:"16px 20px" }}>
        {editing ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
              <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>👤 Nama</label>
              <input value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} style={inputStyle} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
            </div>
            <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
              <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>📱 No. WhatsApp</label>
              <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="08xxx" style={inputStyle} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
            </div>
            <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
              <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>🏘️ Nama Perumahan / Kampung</label>
              <input value={form.perumahan} onChange={e=>setForm(f=>({...f,perumahan:e.target.value}))} placeholder="Griya Indah Residence" style={inputStyle} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
            </div>
            <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
              <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"8px", display:"block" }}>📍 Alamat Lengkap</label>
              <input value={form.alamatDetail} onChange={e=>setForm(f=>({...f,alamatDetail:e.target.value}))} placeholder="Jl./Blok/No" style={{...inputStyle, marginBottom:"8px"}} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                <div style={{ flex:1 }}><label style={{ fontSize:"11px", color:"#9ca3af" }}>RT</label><input value={form.rt} onChange={e=>setForm(f=>({...f,rt:e.target.value}))} placeholder="001" style={inputStyle} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} /></div>
                <div style={{ flex:1 }}><label style={{ fontSize:"11px", color:"#9ca3af" }}>RW</label><input value={form.rw} onChange={e=>setForm(f=>({...f,rw:e.target.value}))} placeholder="005" style={inputStyle} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} /></div>
              </div>
              <input value={form.kelurahan} onChange={e=>setForm(f=>({...f,kelurahan:e.target.value}))} placeholder="Kelurahan / Desa" style={{...inputStyle, marginBottom:"8px"}} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              <input value={form.kecamatan} onChange={e=>setForm(f=>({...f,kecamatan:e.target.value}))} placeholder="Kecamatan" style={{...inputStyle, marginBottom:"8px"}} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              <input value={form.kota} onChange={e=>setForm(f=>({...f,kota:e.target.value}))} placeholder="Kota / Kabupaten" style={inputStyle} onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              {alamatPreview && <div style={{ marginTop:"8px", padding:"8px 10px", background:"#f0fdf4", borderRadius:"8px" }}><p style={{ fontSize:"11px", color:"#059669" }}>📍 {alamatPreview}</p></div>}
            </div>
            <div style={{ display:"flex", gap:"10px", marginTop:"4px" }}>
              <button onClick={()=>setEditing(false)} style={{ flex:1, padding:"14px", borderRadius:"14px", background:"#f3f4f6", border:"none", fontWeight:600, fontSize:"15px", color:"#6b7280", cursor:"pointer" }}>Batal</button>
              <button onClick={save} disabled={saving} style={{ flex:1, padding:"14px", borderRadius:"14px", background:"linear-gradient(135deg,#f59e0b,#ea580c)", border:"none", fontWeight:700, fontSize:"15px", color:"white", cursor:"pointer", opacity:saving?0.5:1 }}>{saving?"Menyimpan...":"💾 Simpan"}</button>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {[
              {l:"Nama",v:userData?.nama||"-",i:"👤"},
              {l:"WhatsApp",v:userData?.phone||"Belum diisi",i:"📱"},
              {l:"Perumahan",v:userData?.perumahan||"Belum diisi",i:"🏘️"},
              {l:"Alamat",v:userData?.alamat||userData?.alamatDetail||"Belum diisi",i:"📍"},
            ].map(f => (
              <div key={f.l} style={{ background:"white", borderRadius:"14px", padding:"14px", display:"flex", alignItems:"center", gap:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#f9fafb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>{f.i}</div>
                <div style={{ minWidth:0 }}><p style={{ fontSize:"11px", color:"#9ca3af" }}>{f.l}</p><p style={{ fontSize:"14px", fontWeight:600, wordBreak:"break-word" }}>{f.v}</p></div>
              </div>
            ))}
            <button onClick={()=>setEditing(true)} style={{ width:"100%", padding:"14px", borderRadius:"14px", border:"2px solid #f59e0b", background:"white", fontWeight:700, fontSize:"15px", color:"#f59e0b", cursor:"pointer", marginTop:"4px" }}>✏️ Edit Profil</button>
          </div>
        )}

        {/* Notifikasi HP */}
        <div style={{ marginTop:"16px" }}>
          <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"8px", textAlign:"center" }}>🔔 Notifikasi HP (Android/Chrome)</p>
          <NotifButton />
        </div>

        <div style={{ marginTop:"20px", display:"flex", flexDirection:"column", gap:"8px" }}>
          <button onClick={switchRole} style={{ width:"100%", padding:"14px", borderRadius:"14px", background:"white", border:"1px solid #e5e7eb", fontWeight:600, fontSize:"14px", color:"#374151", cursor:"pointer" }}>🔄 Ganti ke {role==="seller"?"Pembeli":"Penjual"}</button>
          <button onClick={logout} style={{ width:"100%", padding:"14px", borderRadius:"14px", background:"#fef2f2", border:"none", fontWeight:600, fontSize:"14px", color:"#ef4444", cursor:"pointer" }}>🚪 Keluar</button>
        </div>
        <p style={{ textAlign:"center", fontSize:"11px", color:"#d1d5db", marginTop:"24px" }}>Loman v1.0 — Local Market Nusantara</p>
      </div>
      <BottomNav role={role} active="profile" />
    </div>
  );
}
