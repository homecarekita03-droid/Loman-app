"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import LocationPicker from "@/components/LocationPicker";

const tokoEmojis = ["🏪","🍳","🧁","🥤","👕","🧴","🍕","🍔","☕","🌮","🍜","🥘","🍱","🧆","🛒","🎂"];

export default function TokoSetting() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLoc, setShowLoc] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nama:"", deskripsi:"", alamat:"", emoji:"🏪",
    kategori:"makanan", jamBuka:"08:00", jamTutup:"20:00", whatsapp:"",
  });

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        if(!sq.empty) {
          const s = {id:sq.docs[0].id,...sq.docs[0].data()};
          setStore(s);
          setForm({
            nama:s.nama||"", deskripsi:s.deskripsi||"", alamat:s.alamat||"",
            emoji:s.emoji||"🏪", kategori:s.kategori||"makanan",
            jamBuka:s.jamBuka||"08:00", jamTutup:s.jamTutup||"20:00",
            whatsapp:s.whatsapp||"",
          });
        }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  async function save() {
    if(!store) return; setSaving(true);
    try {
      await updateDoc(doc(db,"toko",store.id), form);
      setStore(p=>({...p,...form}));
      setSaved(true); setTimeout(()=>setSaved(false), 2000);
    } catch(e){ alert("Gagal."); }
    setSaving(false);
  }

  async function saveLocation(pos) {
    if(!store) return;
    try {
      await updateDoc(doc(db,"toko",store.id), { lat:pos.lat, lng:pos.lng });
      setStore(p=>({...p, lat:pos.lat, lng:pos.lng}));
    } catch(e){ console.error(e); }
  }

  const inputStyle = {
    width:"100%", padding:"14px 16px", border:"2px solid #e5e7eb",
    borderRadius:"14px", fontSize:"14px", outline:"none",
    background:"#f9fafb", transition:"border-color 0.2s",
  };

  const kategoriList = [
    {v:"makanan",l:"🍚 Makanan"},{v:"kue",l:"🧁 Kue"},{v:"minuman",l:"🥤 Minuman"},
    {v:"laundry",l:"👕 Laundry"},{v:"kebutuhan",l:"🧴 Kebutuhan"},{v:"lainnya",l:"📦 Lainnya"},
  ];

  if (loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:"48px"}}>🏪</div></div>;

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"100px" }}>
      {/* Header */}
      <div style={{ background:"white", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:"12px", position:"sticky", top:0, zIndex:50 }}>
        <button onClick={()=>router.push("/seller")} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <h1 style={{ fontSize:"18px", fontWeight:900 }}>⚙️ Pengaturan Toko</h1>
      </div>

      {/* Preview Card */}
      <div style={{ padding:"16px 20px" }}>
        <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"8px" }}>Preview tampilan toko Anda:</p>
        <div style={{ background:"white", borderRadius:"16px", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ height:"100px", background:"linear-gradient(135deg, #fef3c7, #fed7aa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"48px" }}>{form.emoji}</div>
          <div style={{ padding:"14px" }}>
            <h3 style={{ fontSize:"16px", fontWeight:800 }}>{form.nama || "Nama Toko"}</h3>
            <div style={{ display:"flex", gap:"8px", marginTop:"4px", fontSize:"12px", color:"#6b7280" }}>
              <span>⭐ {store?.rating || "Baru"}</span>
              <span>📍 {form.alamat || "-"}</span>
              <span>🕐 {form.jamBuka}-{form.jamTutup}</span>
            </div>
            {form.deskripsi && <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"6px" }}>{form.deskripsi}</p>}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:"12px" }}>
        {/* Emoji Toko */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>Ikon Toko</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:"6px" }}>
            {tokoEmojis.map(e => (
              <button key={e} onClick={()=>setForm(f=>({...f,emoji:e}))} style={{
                width:"100%", aspectRatio:"1", borderRadius:"10px", border:"none",
                fontSize:"22px", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: form.emoji===e ? "#fef3c7" : "#f9fafb",
                boxShadow: form.emoji===e ? "0 0 0 2px #f59e0b" : "none",
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Nama */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🏪 Nama Toko</label>
          <input value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} placeholder="Dapur Bu Sari" style={inputStyle}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* Deskripsi */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>📝 Deskripsi</label>
          <textarea value={form.deskripsi} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))}
            placeholder="Aneka masakan rumahan, kue, dll..." rows={3}
            style={{...inputStyle, resize:"none"}}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* Kategori */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>📂 Kategori Utama</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px" }}>
            {kategoriList.map(k => (
              <button key={k.v} onClick={()=>setForm(f=>({...f,kategori:k.v}))} style={{
                padding:"10px", borderRadius:"10px", border:"none", fontSize:"12px",
                fontWeight:600, cursor:"pointer", textAlign:"center",
                background: form.kategori===k.v ? "#fef3c7" : "#f9fafb",
                color: form.kategori===k.v ? "#d97706" : "#6b7280",
                boxShadow: form.kategori===k.v ? "0 0 0 2px #f59e0b" : "none",
              }}>{k.l}</button>
            ))}
          </div>
        </div>

        {/* Alamat */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>📍 Alamat</label>
          <input value={form.alamat} onChange={e=>setForm(f=>({...f,alamat:e.target.value}))} placeholder="Blok A No. 15" style={inputStyle}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* GPS */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🗺️ Lokasi GPS</label>
          {store?.lat ? (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:"13px", color:"#10b981", fontWeight:600 }}>✅ Sudah diatur</p>
                <p style={{ fontSize:"11px", color:"#9ca3af" }}>{store.lat.toFixed(4)}, {store.lng.toFixed(4)}</p>
              </div>
              <button onClick={()=>setShowLoc(true)} style={{ padding:"8px 16px", borderRadius:"10px", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600 }}>Ubah</button>
            </div>
          ) : (
            <button onClick={()=>setShowLoc(true)} style={{ width:"100%", padding:"14px", borderRadius:"12px", background:"#dbeafe", border:"2px dashed #93c5fd", cursor:"pointer", fontSize:"14px", fontWeight:600, color:"#2563eb" }}>
              📍 Atur Lokasi di Peta
            </button>
          )}
        </div>

        {/* Jam Buka */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🕐 Jam Buka</label>
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            <input type="time" value={form.jamBuka} onChange={e=>setForm(f=>({...f,jamBuka:e.target.value}))} style={{...inputStyle, flex:1}} />
            <span style={{ color:"#9ca3af" }}>—</span>
            <input type="time" value={form.jamTutup} onChange={e=>setForm(f=>({...f,jamTutup:e.target.value}))} style={{...inputStyle, flex:1}} />
          </div>
        </div>

        {/* WhatsApp */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>💬 No. WhatsApp</label>
          <input value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))} placeholder="08xxxxxxxxxx" style={inputStyle}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* Save */}
        <button onClick={save} disabled={saving} style={{
          width:"100%", padding:"16px", borderRadius:"14px", border:"none",
          background: saved ? "#10b981" : saving ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
          color:"white", fontWeight:800, fontSize:"16px",
          cursor: saving ? "default" : "pointer",
          boxShadow: saving ? "none" : "0 4px 12px rgba(245,158,11,0.3)",
          marginTop:"4px", transition:"background 0.3s",
        }}>{saved ? "✅ Tersimpan!" : saving ? "Menyimpan..." : "💾 Simpan Pengaturan"}</button>
      </div>

      {showLoc && <LocationPicker
        initialLat={store?.lat} initialLng={store?.lng}
        onSelect={(pos, addr) => { saveLocation(pos); setForm(f=>({...f,alamat:addr.split(",").slice(0,3).join(",")})); }}
        onClose={()=>setShowLoc(false)}
      />}

      <BottomNav role="seller" active="profile" />
    </div>
  );
}
