// ============================================
// 📂🏘️ LOMAN — Multi Kategori + Alamat Fleksibel
// ============================================
// Jalankan: node update-kategori-alamat.js
// ============================================

const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trimStart());
  console.log("  ✅ " + filePath);
}

console.log("");
console.log("📂🏘️ =====================================");
console.log("   Multi Kategori + Alamat Fleksibel");
console.log("======================================");
console.log("");

// =============================================
// 1. TOKO SETTING — Multi Kategori + Alamat RT/RW/Desa
// =============================================
writeFile("app/seller/toko-setting/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BottomNav from "@/components/BottomNav";
import LocationPicker from "@/components/LocationPicker";

const tokoEmojis = ["🏪","🍳","🧁","🥤","👕","🧴","🍕","🍔","☕","🌮","🍜","🥘","🍱","🧆","🛒","🎂"];

const SEMUA_KATEGORI = [
  { id:"makanan", emoji:"🍚", label:"Makanan" },
  { id:"minuman", emoji:"🥤", label:"Minuman" },
  { id:"kue", emoji:"🧁", label:"Kue & Snack" },
  { id:"kebutuhan_pokok", emoji:"🛒", label:"Kebutuhan Pokok" },
  { id:"kelontong", emoji:"🏪", label:"Kelontong" },
  { id:"laundry", emoji:"👕", label:"Laundry" },
  { id:"jasa_elektronik", emoji:"🔧", label:"Jasa Elektronik" },
  { id:"jasa_bangunan", emoji:"🏗️", label:"Jasa Bangunan" },
  { id:"jasa_otomotif", emoji:"🔩", label:"Jasa Otomotif" },
  { id:"jasa_kebersihan", emoji:"🧹", label:"Jasa Kebersihan" },
  { id:"jasa_jahit", emoji:"🧵", label:"Jasa Jahit" },
  { id:"jasa_kecantikan", emoji:"💇", label:"Kecantikan" },
  { id:"jasa_kesehatan", emoji:"💊", label:"Kesehatan" },
  { id:"jasa_pendidikan", emoji:"📚", label:"Les & Kursus" },
  { id:"fashion", emoji:"👗", label:"Fashion" },
  { id:"tanaman", emoji:"🌿", label:"Tanaman" },
  { id:"frozen_food", emoji:"🧊", label:"Frozen Food" },
  { id:"catering", emoji:"🍱", label:"Catering" },
  { id:"lainnya", emoji:"📦", label:"Lainnya" },
];

export default function TokoSetting() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoc, setShowLoc] = useState(false);
  const [form, setForm] = useState({
    nama:"", deskripsi:"", emoji:"🏪",
    jamBuka:"08:00", jamTutup:"20:00", whatsapp:"",
    // Multi kategori
    kategori:"", // kategori utama (backward compatible)
    kategoriList: [], // multi kategori baru
    // Alamat fleksibel
    alamatDetail:"", // Blok A No. 15
    rt:"", rw:"",
    kelurahan:"", kecamatan:"", kota:"",
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");

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
            nama:s.nama||"", deskripsi:s.deskripsi||"", emoji:s.emoji||"🏪",
            jamBuka:s.jamBuka||"08:00", jamTutup:s.jamTutup||"20:00",
            whatsapp:s.whatsapp||"",
            kategori:s.kategori||"",
            kategoriList: s.kategoriList || (s.kategori ? [s.kategori] : []),
            alamatDetail: s.alamatDetail || s.alamat || "",
            rt: s.rt||"", rw: s.rw||"",
            kelurahan: s.kelurahan||"", kecamatan: s.kecamatan||"", kota: s.kota||"",
          });
          if (s.banner) setBannerPreview(s.banner);
          if (s.logo) setLogoPreview(s.logo);
        }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  function toggleKategori(id) {
    setForm(f => {
      const list = f.kategoriList.includes(id)
        ? f.kategoriList.filter(k => k !== id)
        : [...f.kategoriList, id];
      return { ...f, kategoriList: list, kategori: list[0] || "" };
    });
  }

  function handleImageSelect(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { alert("Maksimal 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type==="banner") { setBannerFile(file); setBannerPreview(reader.result); }
      else { setLogoFile(file); setLogoPreview(reader.result); }
    };
    reader.readAsDataURL(file);
  }

  async function uploadImage(file, folder) {
    if (!file) return null;
    try {
      const fn = Date.now()+"_"+file.name.replace(/[^a-zA-Z0-9.]/g,"_");
      const r = ref(storage, folder+"/"+fn);
      await uploadBytes(r, file);
      return await getDownloadURL(r);
    } catch(e) { return null; }
  }

  async function removeBanner() { if(!store||!confirm("Hapus banner?")) return; await updateDoc(doc(db,"toko",store.id),{banner:""}); setStore(p=>({...p,banner:""})); setBannerPreview(null); setBannerFile(null); }
  async function removeLogo() { if(!store||!confirm("Hapus logo?")) return; await updateDoc(doc(db,"toko",store.id),{logo:""}); setStore(p=>({...p,logo:""})); setLogoPreview(null); setLogoFile(null); }

  async function save() {
    if(!store) return;
    setSaving(true); setUploadMsg("");

    // Build alamat gabungan untuk backward compatible
    let alamatParts = [];
    if (form.alamatDetail) alamatParts.push(form.alamatDetail);
    if (form.rt) alamatParts.push("RT "+form.rt);
    if (form.rw) alamatParts.push("RW "+form.rw);
    if (form.kelurahan) alamatParts.push(form.kelurahan);
    if (form.kecamatan) alamatParts.push(form.kecamatan);
    if (form.kota) alamatParts.push(form.kota);
    const alamatGabungan = alamatParts.join(", ");

    let updates = {
      nama: form.nama, deskripsi: form.deskripsi, emoji: form.emoji,
      jamBuka: form.jamBuka, jamTutup: form.jamTutup, whatsapp: form.whatsapp,
      kategori: form.kategoriList[0] || form.kategori || "",
      kategoriList: form.kategoriList,
      alamat: alamatGabungan,
      alamatDetail: form.alamatDetail,
      rt: form.rt, rw: form.rw,
      kelurahan: form.kelurahan, kecamatan: form.kecamatan, kota: form.kota,
    };

    if (bannerFile) { setUploadMsg("Mengupload banner..."); const url = await uploadImage(bannerFile,"toko-banners"); if(url) { updates.banner=url; setBannerFile(null); } }
    if (logoFile) { setUploadMsg("Mengupload logo..."); const url = await uploadImage(logoFile,"toko-logos"); if(url) { updates.logo=url; setLogoFile(null); } }

    try {
      setUploadMsg("Menyimpan...");
      await updateDoc(doc(db,"toko",store.id), updates);
      setStore(p=>({...p,...updates}));
      setSaved(true); setUploadMsg("");
      setTimeout(()=>setSaved(false), 2000);
    } catch(e) { alert("Gagal."); setUploadMsg(""); }
    setSaving(false);
  }

  async function saveLocation(pos) {
    if(!store) return;
    await updateDoc(doc(db,"toko",store.id), {lat:pos.lat,lng:pos.lng});
    setStore(p=>({...p,lat:pos.lat,lng:pos.lng}));
  }

  const inputStyle = { width:"100%", padding:"14px 16px", border:"2px solid #e5e7eb", borderRadius:"14px", fontSize:"14px", outline:"none", background:"#f9fafb", transition:"border-color 0.2s" };
  const inputSmall = { ...inputStyle, padding:"12px 14px", fontSize:"14px" };

  if (loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:"48px"}}>🏪</div></div>;

  // Build alamat preview
  let alamatPreview = [];
  if (form.alamatDetail) alamatPreview.push(form.alamatDetail);
  if (form.rt || form.rw) alamatPreview.push((form.rt?"RT "+form.rt:"")+(form.rw?" / RW "+form.rw:""));
  if (form.kelurahan) alamatPreview.push(form.kelurahan);
  if (form.kecamatan) alamatPreview.push("Kec. "+form.kecamatan);
  if (form.kota) alamatPreview.push(form.kota);

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"100px" }}>
      <div style={{ background:"white", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:"12px", position:"sticky", top:0, zIndex:50 }}>
        <button onClick={()=>router.push("/seller")} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <h1 style={{ fontSize:"18px", fontWeight:900 }}>⚙️ Pengaturan Toko</h1>
      </div>

      {/* Live Preview */}
      <div style={{ padding:"16px 20px" }}>
        <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"8px" }}>👁️ Preview:</p>
        <div style={{ background:"white", borderRadius:"16px", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{
            height:"120px", position:"relative",
            background: bannerPreview ? "url("+bannerPreview+") center/cover" : "linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {!bannerPreview && <span style={{ fontSize:"40px", opacity:0.5 }}>{form.emoji}</span>}
            {logoPreview && <div style={{ position:"absolute", bottom:"-20px", left:"14px", width:"48px", height:"48px", borderRadius:"14px", border:"3px solid white", background:"url("+logoPreview+") center/cover", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}></div>}
          </div>
          <div style={{ padding: logoPreview ? "28px 14px 12px" : "12px 14px" }}>
            <h3 style={{ fontSize:"15px", fontWeight:800 }}>{form.nama||"Nama Toko"}</h3>
            {/* Kategori badges */}
            {form.kategoriList.length > 0 && (
              <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", marginTop:"6px" }}>
                {form.kategoriList.map(k => {
                  const cat = SEMUA_KATEGORI.find(c=>c.id===k);
                  return cat ? <span key={k} style={{ padding:"2px 8px", borderRadius:"10px", background:"#fef3c7", color:"#d97706", fontSize:"10px", fontWeight:600 }}>{cat.emoji} {cat.label}</span> : null;
                })}
              </div>
            )}
            <div style={{ display:"flex", gap:"6px", marginTop:"6px", fontSize:"11px", color:"#6b7280", flexWrap:"wrap" }}>
              <span>📍 {alamatPreview.join(", ") || "-"}</span>
              <span>• 🕐 {form.jamBuka}-{form.jamTutup}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:"12px" }}>

        {/* Banner */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>🖼️ Banner Toko</label>
          {bannerPreview ? (
            <div style={{ position:"relative", borderRadius:"12px", overflow:"hidden" }}>
              <img src={bannerPreview} alt="" style={{ width:"100%", height:"100px", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", bottom:"6px", right:"6px", display:"flex", gap:"4px" }}>
                <label style={{ padding:"5px 10px", borderRadius:"16px", background:"rgba(0,0,0,0.6)", color:"white", fontSize:"11px", fontWeight:600, cursor:"pointer" }}>📷 Ganti<input type="file" accept="image/*" onChange={e=>handleImageSelect(e,"banner")} style={{display:"none"}} /></label>
                <button onClick={removeBanner} style={{ padding:"5px 10px", borderRadius:"16px", background:"rgba(239,68,68,0.8)", color:"white", fontSize:"11px", fontWeight:600, cursor:"pointer", border:"none" }}>🗑️</button>
              </div>
            </div>
          ) : (
            <label style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"20px", cursor:"pointer", border:"2px dashed #d1d5db", borderRadius:"12px", background:"#f9fafb" }}>
              <span style={{ fontSize:"28px", marginBottom:"6px" }}>🖼️</span>
              <span style={{ fontSize:"12px", color:"#6b7280" }}>Upload banner (maks 5MB)</span>
              <input type="file" accept="image/*" onChange={e=>handleImageSelect(e,"banner")} style={{display:"none"}} />
            </label>
          )}
        </div>

        {/* Logo */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>🏷️ Logo Toko</label>
          <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
            {logoPreview ? (
              <div style={{ position:"relative" }}>
                <img src={logoPreview} alt="" style={{ width:"64px", height:"64px", borderRadius:"14px", objectFit:"cover", border:"2px solid #e5e7eb" }} />
                <button onClick={removeLogo} style={{ position:"absolute", top:"-6px", right:"-6px", width:"20px", height:"20px", borderRadius:"50%", background:"#ef4444", color:"white", border:"2px solid white", cursor:"pointer", fontSize:"9px", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>
            ) : (
              <label style={{ width:"64px", height:"64px", borderRadius:"14px", border:"2px dashed #d1d5db", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f9fafb", flexShrink:0 }}>
                <span style={{ fontSize:"20px" }}>📷</span>
                <input type="file" accept="image/*" onChange={e=>handleImageSelect(e,"logo")} style={{display:"none"}} />
              </label>
            )}
            {logoPreview && <label style={{ padding:"6px 12px", borderRadius:"8px", background:"#f3f4f6", fontSize:"12px", fontWeight:600, color:"#374151", cursor:"pointer" }}>Ganti<input type="file" accept="image/*" onChange={e=>handleImageSelect(e,"logo")} style={{display:"none"}} /></label>}
          </div>
        </div>

        {/* Emoji */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>🎨 Ikon Emoji</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:"6px" }}>
            {tokoEmojis.map(e => (
              <button key={e} onClick={()=>setForm(f=>({...f,emoji:e}))} style={{ width:"100%", aspectRatio:"1", borderRadius:"10px", border:"none", fontSize:"20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background: form.emoji===e ? "#fef3c7" : "#f9fafb", boxShadow: form.emoji===e ? "0 0 0 2px #f59e0b" : "none" }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Nama */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🏪 Nama Toko</label>
          <input value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} placeholder="Dapur Bu Sari" style={inputStyle}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* ===== MULTI KATEGORI ===== */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"4px", display:"block" }}>📂 Kategori Toko</label>
          <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"10px" }}>Pilih satu atau lebih kategori yang sesuai dengan toko Anda</p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
            {SEMUA_KATEGORI.map(k => {
              const selected = form.kategoriList.includes(k.id);
              return (
                <button key={k.id} onClick={()=>toggleKategori(k.id)} style={{
                  padding:"10px 8px", borderRadius:"10px", border:"none",
                  fontSize:"12px", fontWeight:600, cursor:"pointer",
                  textAlign:"left", display:"flex", alignItems:"center", gap:"8px",
                  background: selected ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "#f9fafb",
                  color: selected ? "#d97706" : "#6b7280",
                  boxShadow: selected ? "0 0 0 2px #f59e0b" : "none",
                  transition:"all 0.15s",
                }}>
                  <span style={{ fontSize:"16px" }}>{k.emoji}</span>
                  <span style={{ flex:1 }}>{k.label}</span>
                  {selected && <span style={{ fontSize:"12px" }}>✓</span>}
                </button>
              );
            })}
          </div>

          {form.kategoriList.length > 0 && (
            <div style={{ marginTop:"10px", padding:"8px 12px", background:"#f0fdf4", borderRadius:"8px" }}>
              <p style={{ fontSize:"11px", color:"#059669" }}>
                ✅ {form.kategoriList.length} kategori dipilih: {form.kategoriList.map(k => SEMUA_KATEGORI.find(c=>c.id===k)?.label).join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Deskripsi */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>📝 Deskripsi Toko</label>
          <textarea value={form.deskripsi} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))} placeholder="Jelaskan toko Anda, produk/jasa yang ditawarkan..." rows={3} style={{...inputStyle, resize:"none"}}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {/* ===== ALAMAT FLEKSIBEL ===== */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"4px", display:"block" }}>📍 Alamat Lengkap</label>
          <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"12px" }}>Isi sesuai lokasi toko Anda</p>

          {/* Alamat Detail */}
          <div style={{ marginBottom:"10px" }}>
            <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>Alamat Detail (Jalan/Blok/No)</label>
            <input value={form.alamatDetail} onChange={e=>setForm(f=>({...f,alamatDetail:e.target.value}))} placeholder="Jl. Melati No. 10 / Blok A No. 15" style={inputSmall}
              onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>

          {/* RT / RW */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>RT</label>
              <input value={form.rt} onChange={e=>setForm(f=>({...f,rt:e.target.value}))} placeholder="001" style={inputSmall} inputMode="numeric"
                onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>RW</label>
              <input value={form.rw} onChange={e=>setForm(f=>({...f,rw:e.target.value}))} placeholder="005" style={inputSmall} inputMode="numeric"
                onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
            </div>
          </div>

          {/* Kelurahan / Desa */}
          <div style={{ marginBottom:"10px" }}>
            <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>Kelurahan / Desa</label>
            <input value={form.kelurahan} onChange={e=>setForm(f=>({...f,kelurahan:e.target.value}))} placeholder="Desa Sukamaju" style={inputSmall}
              onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>

          {/* Kecamatan */}
          <div style={{ marginBottom:"10px" }}>
            <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>Kecamatan</label>
            <input value={form.kecamatan} onChange={e=>setForm(f=>({...f,kecamatan:e.target.value}))} placeholder="Kec. Cikarang Utara" style={inputSmall}
              onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>

          {/* Kota */}
          <div style={{ marginBottom:"10px" }}>
            <label style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"4px", display:"block" }}>Kota / Kabupaten</label>
            <input value={form.kota} onChange={e=>setForm(f=>({...f,kota:e.target.value}))} placeholder="Kab. Bekasi" style={inputSmall}
              onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
          </div>

          {/* Alamat Preview */}
          {alamatPreview.length > 0 && (
            <div style={{ padding:"10px 12px", background:"#f0fdf4", borderRadius:"8px", marginTop:"4px" }}>
              <p style={{ fontSize:"11px", color:"#059669", fontWeight:600, marginBottom:"2px" }}>📍 Alamat lengkap:</p>
              <p style={{ fontSize:"12px", color:"#065f46" }}>{alamatPreview.join(", ")}</p>
            </div>
          )}
        </div>

        {/* GPS */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🗺️ Lokasi GPS</label>
          {store?.lat ? (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><p style={{ fontSize:"13px", color:"#10b981", fontWeight:600 }}>✅ Sudah diatur</p></div>
              <button onClick={()=>setShowLoc(true)} style={{ padding:"8px 16px", borderRadius:"10px", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600 }}>Ubah</button>
            </div>
          ) : (
            <button onClick={()=>setShowLoc(true)} style={{ width:"100%", padding:"14px", borderRadius:"12px", background:"#dbeafe", border:"2px dashed #93c5fd", cursor:"pointer", fontSize:"14px", fontWeight:600, color:"#2563eb" }}>📍 Atur Lokasi di Peta</button>
          )}
        </div>

        {/* Jam Buka */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>🕐 Jam Buka</label>
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            <input type="time" value={form.jamBuka} onChange={e=>setForm(f=>({...f,jamBuka:e.target.value}))} style={{...inputSmall, flex:1}} />
            <span style={{ color:"#9ca3af" }}>—</span>
            <input type="time" value={form.jamTutup} onChange={e=>setForm(f=>({...f,jamTutup:e.target.value}))} style={{...inputSmall, flex:1}} />
          </div>
        </div>

        {/* WhatsApp */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"6px", display:"block" }}>💬 No. WhatsApp</label>
          <input value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))} placeholder="08xxxxxxxxxx" style={inputSmall}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>

        {uploadMsg && <p style={{ textAlign:"center", fontSize:"13px", color:"#f59e0b", fontWeight:600 }}>⏳ {uploadMsg}</p>}

        <button onClick={save} disabled={saving} style={{
          width:"100%", padding:"16px", borderRadius:"14px", border:"none",
          background: saved ? "#10b981" : saving ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
          color:"white", fontWeight:800, fontSize:"16px",
          cursor: saving ? "default" : "pointer",
          marginTop:"4px", transition:"background 0.3s",
        }}>{saved ? "✅ Tersimpan!" : saving ? "Menyimpan..." : "💾 Simpan Pengaturan"}</button>
      </div>

      {showLoc && <LocationPicker initialLat={store?.lat} initialLng={store?.lng}
        onSelect={(pos,addr)=>{saveLocation(pos);}} onClose={()=>setShowLoc(false)} />}
      <BottomNav role="seller" active="profile" />
    </div>
  );
}
`);

// =============================================
// 2. BUYER HOME — Update kategori list
// =============================================
const buyerPath = "app/buyer/page.js";
if (fs.existsSync(buyerPath)) {
  let c = fs.readFileSync(buyerPath, "utf-8");

  // Replace old categories
  const oldCats = `const categories = [
  { id: "all", emoji: "🔥", name: "Semua" },
  { id: "makanan", emoji: "🍚", name: "Makanan" },
  { id: "kue", emoji: "🧁", name: "Kue & Snack" },
  { id: "minuman", emoji: "🥤", name: "Minuman" },
  { id: "laundry", emoji: "👕", name: "Laundry" },
  { id: "kebutuhan", emoji: "🧴", name: "Kebutuhan" },
  { id: "lainnya", emoji: "📦", name: "Lainnya" },
];`;

  const newCats = `const categories = [
  { id: "all", emoji: "🔥", name: "Semua" },
  { id: "makanan", emoji: "🍚", name: "Makanan" },
  { id: "minuman", emoji: "🥤", name: "Minuman" },
  { id: "kue", emoji: "🧁", name: "Kue & Snack" },
  { id: "kebutuhan_pokok", emoji: "🛒", name: "Sembako" },
  { id: "kelontong", emoji: "🏪", name: "Kelontong" },
  { id: "frozen_food", emoji: "🧊", name: "Frozen Food" },
  { id: "laundry", emoji: "👕", name: "Laundry" },
  { id: "jasa_elektronik", emoji: "🔧", name: "Jasa Elektronik" },
  { id: "jasa_bangunan", emoji: "🏗️", name: "Jasa Bangunan" },
  { id: "jasa_kecantikan", emoji: "💇", name: "Kecantikan" },
  { id: "fashion", emoji: "👗", name: "Fashion" },
  { id: "tanaman", emoji: "🌿", name: "Tanaman" },
  { id: "catering", emoji: "🍱", name: "Catering" },
  { id: "lainnya", emoji: "📦", name: "Lainnya" },
];`;

  if (c.includes(oldCats)) {
    c = c.replace(oldCats, newCats);

    // Update filter agar support multi kategori (kategoriList)
    c = c.replace(
      "s.kategori?.toLowerCase() === cat",
      "(s.kategoriList?.includes(cat) || s.kategori?.toLowerCase() === cat)"
    );

    // Make categories scrollable instead of grid (terlalu banyak untuk grid)
    c = c.replace(
      'gridTemplateColumns:"repeat(4, 1fr)"',
      'gridTemplateColumns:"repeat(5, 1fr)"'
    );

    fs.writeFileSync(buyerPath, c);
    console.log("  ✅ " + buyerPath + " (kategori + filter updated)");
  } else {
    console.log("  ℹ️ " + buyerPath + " (kategori sudah berbeda, skip)");
  }
}

// =============================================
// 3. SELLER PRODUK — Update kategori produk
// =============================================
const produkPath = "app/seller/produk/page.js";
if (fs.existsSync(produkPath)) {
  let c = fs.readFileSync(produkPath, "utf-8");

  const oldKatProduk = `const kategoriList = [
  { value:"makanan", label:"🍚 Makanan" },
  { value:"kue", label:"🧁 Kue & Snack" },
  { value:"minuman", label:"🥤 Minuman" },
  { value:"laundry", label:"👕 Laundry" },
  { value:"kebutuhan", label:"🧴 Kebutuhan" },
  { value:"lainnya", label:"📦 Lainnya" },
];`;

  const newKatProduk = `const kategoriList = [
  { value:"makanan", label:"🍚 Makanan" },
  { value:"minuman", label:"🥤 Minuman" },
  { value:"kue", label:"🧁 Kue & Snack" },
  { value:"kebutuhan_pokok", label:"🛒 Kebutuhan Pokok" },
  { value:"kelontong", label:"🏪 Kelontong" },
  { value:"frozen_food", label:"🧊 Frozen Food" },
  { value:"laundry", label:"👕 Laundry" },
  { value:"jasa_elektronik", label:"🔧 Jasa Elektronik" },
  { value:"jasa_bangunan", label:"🏗️ Jasa Bangunan" },
  { value:"jasa_otomotif", label:"🔩 Jasa Otomotif" },
  { value:"jasa_kebersihan", label:"🧹 Jasa Kebersihan" },
  { value:"jasa_jahit", label:"🧵 Jasa Jahit" },
  { value:"jasa_kecantikan", label:"💇 Kecantikan" },
  { value:"jasa_kesehatan", label:"💊 Kesehatan" },
  { value:"jasa_pendidikan", label:"📚 Les & Kursus" },
  { value:"fashion", label:"👗 Fashion" },
  { value:"tanaman", label:"🌿 Tanaman" },
  { value:"catering", label:"🍱 Catering" },
  { value:"lainnya", label:"📦 Lainnya" },
];`;

  if (c.includes(oldKatProduk)) {
    c = c.replace(oldKatProduk, newKatProduk);

    // Update grid layout to fit more categories
    c = c.replace(
      'gridTemplateColumns:"1fr 1fr", gap:"6px"',
      'gridTemplateColumns:"1fr 1fr", gap:"5px", maxHeight:"200px", overflowY:"auto"'
    );

    fs.writeFileSync(produkPath, c);
    console.log("  ✅ " + produkPath + " (kategori produk updated)");
  } else {
    console.log("  ℹ️ " + produkPath + " (kategori sudah berbeda, skip)");
  }
}

// =============================================
// 4. PROFIL BUYER — Tambah alamat RT/RW/Desa
// =============================================
writeFile("app/buyer/profil/page.js", `
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
    try { await updateDoc(doc(db,"users",user.uid),updates); setUserData(p=>({...p,...updates})); setEditing(false); } catch(e){alert("Gagal.");}
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
`);

writeFile("app/seller/profil/page.js", `
export { default } from "@/app/buyer/profil/page";
`);

console.log("");
console.log("🎉 ========================================");
console.log("   MULTI KATEGORI + ALAMAT SELESAI!");
console.log("========================================");
console.log("");
console.log("   📂 KATEGORI TOKO (19 pilihan, multi-select):");
console.log("   ✅ Makanan, Minuman, Kue & Snack");
console.log("   ✅ Kebutuhan Pokok, Kelontong, Frozen Food");
console.log("   ✅ Laundry, Catering");
console.log("   ✅ Jasa Elektronik, Bangunan, Otomotif");
console.log("   ✅ Jasa Kebersihan, Jahit, Kecantikan");
console.log("   ✅ Kesehatan, Les & Kursus");
console.log("   ✅ Fashion, Tanaman, Lainnya");
console.log("   ✅ Penjual bisa pilih LEBIH DARI 1 kategori");
console.log("   ✅ Badge kategori tampil di preview toko");
console.log("");
console.log("   🏘️ ALAMAT FLEKSIBEL:");
console.log("   ✅ Alamat Detail (Jalan/Blok/No)");
console.log("   ✅ RT & RW");
console.log("   ✅ Kelurahan / Desa");
console.log("   ✅ Kecamatan");
console.log("   ✅ Kota / Kabupaten");
console.log("   ✅ Preview alamat gabungan");
console.log("   ✅ Berlaku untuk Penjual & Pembeli");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Deploy:  git add . && git commit -m 'multi kategori + alamat' && git push");
console.log("");
