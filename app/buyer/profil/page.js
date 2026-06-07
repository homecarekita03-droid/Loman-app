"use client";
import { useState, useEffect } from "react";
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
  const [form, setForm] = useState({ nama:"", phone:"", alamat:"", perumahan:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) setForm({ nama:userData.nama||"", phone:userData.phone||"", alamat:userData.alamat||"", perumahan:userData.perumahan||"" });
  }, [userData]);

  async function save() {
    if(!user) return; setSaving(true);
    try { await updateDoc(doc(db,"users",user.uid),form); setUserData(p=>({...p,...form})); setEditing(false); } catch(e){alert("Gagal.");}
    setSaving(false);
  }
  async function logout() { if(confirm("Yakin keluar?")) { await signOut(auth); router.push("/"); } }
  async function switchRole() {
    if(!user) return; const nr = userData?.role==="seller"?"buyer":"seller";
    try { await updateDoc(doc(db,"users",user.uid),{role:nr}); setUserData(p=>({...p,role:nr})); router.push(nr==="seller"?"/seller":"/buyer"); } catch(e){console.error(e);}
  }

  const inputStyle = {
    width:"100%", padding:"12px 14px", border:"2px solid #e5e7eb",
    borderRadius:"12px", fontSize:"14px", outline:"none",
    background:"#f9fafb", transition:"border-color 0.2s",
  };

  const role = userData?.role || "buyer";

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg, #f59e0b, #ea580c)",
        padding:"24px 20px 48px", borderRadius:"0 0 24px 24px",
        textAlign:"center",
      }}>
        <h1 style={{ fontSize:"18px", fontWeight:800, color:"white" }}>Profil Saya</h1>
      </div>

      {/* Avatar Card */}
      <div style={{
        background:"white", borderRadius:"20px", margin:"-32px 20px 0",
        padding:"24px", textAlign:"center", position:"relative", zIndex:5,
        boxShadow:"0 4px 16px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width:"80px", height:"80px", borderRadius:"50%", margin:"0 auto 12px",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"40px", background:"linear-gradient(135deg, #fef3c7, #fde68a)",
          overflow:"hidden",
        }}>
          {user?.photoURL ? <img src={user.photoURL} alt="" style={{width:"80px",height:"80px",borderRadius:"50%",objectFit:"cover"}} /> : "👤"}
        </div>
        <h2 style={{ fontSize:"20px", fontWeight:800, color:"#1f2937" }}>{userData?.nama||"User"}</h2>
        <p style={{ fontSize:"13px", color:"#9ca3af", marginTop:"2px" }}>{user?.email}</p>
        <span style={{
          display:"inline-block", marginTop:"8px", padding:"4px 16px",
          borderRadius:"20px", fontSize:"12px", fontWeight:600,
          background: role==="seller" ? "#fef3c7" : "#dbeafe",
          color: role==="seller" ? "#d97706" : "#2563eb",
        }}>{role==="seller" ? "🏪 Penjual" : "🛒 Pembeli"}</span>
      </div>

      {/* Fields */}
      <div style={{ padding:"16px 20px" }}>
        {editing ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {[
              {l:"Nama Lengkap",k:"nama",p:"Nama Anda",icon:"👤"},
              {l:"No. WhatsApp",k:"phone",p:"08xxxxxxxxxx",icon:"📱"},
              {l:"Alamat Rumah",k:"alamat",p:"Blok A No. 15",icon:"🏠"},
              {l:"Nama Perumahan",k:"perumahan",p:"Griya Indah Residence",icon:"📍"},
            ].map(f => (
              <div key={f.k} style={{ background:"white", borderRadius:"14px", padding:"14px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <label style={{ fontSize:"12px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"flex", alignItems:"center", gap:"6px" }}>
                  <span>{f.icon}</span> {f.l}
                </label>
                <input value={form[f.k]} onChange={e=>setForm(prev=>({...prev,[f.k]:e.target.value}))}
                  placeholder={f.p} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>
            ))}
            <div style={{ display:"flex", gap:"10px", marginTop:"4px" }}>
              <button onClick={()=>setEditing(false)} style={{ flex:1, padding:"14px", borderRadius:"14px", background:"#f3f4f6", border:"none", fontWeight:600, fontSize:"15px", color:"#6b7280", cursor:"pointer" }}>Batal</button>
              <button onClick={save} disabled={saving} style={{ flex:1, padding:"14px", borderRadius:"14px", background:"linear-gradient(135deg,#f59e0b,#ea580c)", border:"none", fontWeight:700, fontSize:"15px", color:"white", cursor:"pointer", opacity:saving?0.5:1 }}>{saving?"Menyimpan...":"💾 Simpan"}</button>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {[
              {l:"Nama",v:userData?.nama||"-",icon:"👤"},
              {l:"WhatsApp",v:userData?.phone||"Belum diisi",icon:"📱"},
              {l:"Alamat",v:userData?.alamat||"Belum diisi",icon:"🏠"},
              {l:"Perumahan",v:userData?.perumahan||"Belum diisi",icon:"📍"},
            ].map(f => (
              <div key={f.l} style={{
                background:"white", borderRadius:"14px", padding:"14px",
                display:"flex", alignItems:"center", gap:"12px",
                boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#f9fafb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize:"11px", color:"#9ca3af" }}>{f.l}</p>
                  <p style={{ fontSize:"14px", fontWeight:600, color:"#1f2937" }}>{f.v}</p>
                </div>
              </div>
            ))}
            <button onClick={()=>setEditing(true)} style={{
              width:"100%", padding:"14px", borderRadius:"14px",
              border:"2px solid #f59e0b", background:"white",
              fontWeight:700, fontSize:"15px", color:"#f59e0b",
              cursor:"pointer", marginTop:"4px",
            }}>✏️ Edit Profil</button>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop:"20px", display:"flex", flexDirection:"column", gap:"8px" }}>
          <button onClick={switchRole} style={{
            width:"100%", padding:"14px", borderRadius:"14px",
            background:"white", border:"1px solid #e5e7eb",
            fontWeight:600, fontSize:"14px", color:"#374151",
            cursor:"pointer", boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
          }}>🔄 Ganti ke {role==="seller"?"Pembeli":"Penjual"}</button>
          <button onClick={logout} style={{
            width:"100%", padding:"14px", borderRadius:"14px",
            background:"#fef2f2", border:"none",
            fontWeight:600, fontSize:"14px", color:"#ef4444",
            cursor:"pointer",
          }}>🚪 Keluar dari Akun</button>
        </div>

        {/* Version */}
        <p style={{ textAlign:"center", fontSize:"11px", color:"#d1d5db", marginTop:"24px" }}>Loman v1.0 — Local Market Nusantara</p>
      </div>

      <BottomNav role={role} active="profile" />
    </div>
  );
}
