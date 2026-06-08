// ============================================
// 🖼️ LOMAN — Banner & Logo Toko Custom
// ============================================
// Jalankan: node tambah-banner-toko.js
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
console.log("🖼️ ========================================");
console.log("   Tambah Banner & Logo Toko");
console.log("========================================");
console.log("");

// =============================================
// 1. TOKO SETTING — Tambah Upload Banner & Logo
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

export default function TokoSetting() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoc, setShowLoc] = useState(false);
  const [form, setForm] = useState({
    nama:"", deskripsi:"", alamat:"", emoji:"🏪",
    kategori:"makanan", jamBuka:"08:00", jamTutup:"20:00", whatsapp:"",
  });

  // Banner & Logo
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
            nama:s.nama||"", deskripsi:s.deskripsi||"", alamat:s.alamat||"",
            emoji:s.emoji||"🏪", kategori:s.kategori||"makanan",
            jamBuka:s.jamBuka||"08:00", jamTutup:s.jamTutup||"20:00",
            whatsapp:s.whatsapp||"",
          });
          if (s.banner) setBannerPreview(s.banner);
          if (s.logo) setLogoPreview(s.logo);
        }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  function handleImageSelect(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Maksimal 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "banner") { setBannerFile(file); setBannerPreview(reader.result); }
      else { setLogoFile(file); setLogoPreview(reader.result); }
    };
    reader.readAsDataURL(file);
  }

  async function uploadImage(file, folder) {
    if (!file) return null;
    try {
      const filename = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storageRef = ref(storage, folder + "/" + filename);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (e) { console.error("Upload error:", e); return null; }
  }

  async function save() {
    if(!store) return;
    setSaving(true);
    setUploadMsg("");

    let updates = { ...form };

    // Upload banner jika ada file baru
    if (bannerFile) {
      setUploadMsg("Mengupload banner...");
      const url = await uploadImage(bannerFile, "toko-banners");
      if (url) { updates.banner = url; setBannerFile(null); }
    }

    // Upload logo jika ada file baru
    if (logoFile) {
      setUploadMsg("Mengupload logo...");
      const url = await uploadImage(logoFile, "toko-logos");
      if (url) { updates.logo = url; setLogoFile(null); }
    }

    try {
      setUploadMsg("Menyimpan...");
      await updateDoc(doc(db,"toko",store.id), updates);
      setStore(p => ({ ...p, ...updates }));
      setSaved(true);
      setUploadMsg("");
      setTimeout(() => setSaved(false), 2000);
    } catch(e) { alert("Gagal menyimpan."); setUploadMsg(""); }
    setSaving(false);
  }

  async function removeBanner() {
    if (!store || !confirm("Hapus banner toko?")) return;
    try {
      await updateDoc(doc(db,"toko",store.id), { banner: "" });
      setStore(p => ({ ...p, banner: "" }));
      setBannerPreview(null);
      setBannerFile(null);
    } catch(e) { console.error(e); }
  }

  async function removeLogo() {
    if (!store || !confirm("Hapus logo toko?")) return;
    try {
      await updateDoc(doc(db,"toko",store.id), { logo: "" });
      setStore(p => ({ ...p, logo: "" }));
      setLogoPreview(null);
      setLogoFile(null);
    } catch(e) { console.error(e); }
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

      {/* ===== LIVE PREVIEW ===== */}
      <div style={{ padding:"16px 20px" }}>
        <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"8px" }}>👁️ Preview tampilan toko Anda:</p>
        <div style={{ background:"white", borderRadius:"16px", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          {/* Banner */}
          <div style={{
            height:"140px", position:"relative",
            background: bannerPreview
              ? "url(" + bannerPreview + ") center/cover no-repeat"
              : "linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {!bannerPreview && <span style={{ fontSize:"48px", opacity:0.5 }}>{form.emoji}</span>}
            {/* Logo overlay */}
            {logoPreview && (
              <div style={{
                position:"absolute", bottom:"-24px", left:"16px",
                width:"56px", height:"56px", borderRadius:"16px",
                border:"3px solid white",
                background:"url(" + logoPreview + ") center/cover no-repeat",
                boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
              }}></div>
            )}
          </div>
          <div style={{ padding: logoPreview ? "32px 14px 14px" : "14px" }}>
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

      {/* ===== FORM ===== */}
      <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:"12px" }}>

        {/* ===== BANNER UPLOAD ===== */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>🖼️ Banner Toko</label>
          <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"10px" }}>Gambar lebar yang tampil di atas toko. Rekomendasi ukuran 1200x400 pixel.</p>

          {bannerPreview ? (
            <div style={{ position:"relative", borderRadius:"12px", overflow:"hidden" }}>
              <img src={bannerPreview} alt="Banner" style={{ width:"100%", height:"120px", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", bottom:"8px", right:"8px", display:"flex", gap:"6px" }}>
                <label style={{
                  padding:"6px 12px", borderRadius:"20px",
                  background:"rgba(0,0,0,0.6)", color:"white",
                  fontSize:"11px", fontWeight:600, cursor:"pointer",
                }}>
                  📷 Ganti
                  <input type="file" accept="image/*" onChange={e=>handleImageSelect(e,"banner")} style={{ display:"none" }} />
                </label>
                <button onClick={removeBanner} style={{
                  padding:"6px 12px", borderRadius:"20px",
                  background:"rgba(239,68,68,0.8)", color:"white",
                  fontSize:"11px", fontWeight:600, cursor:"pointer", border:"none",
                }}>🗑️ Hapus</button>
              </div>
            </div>
          ) : (
            <label style={{
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", padding:"24px", cursor:"pointer",
              border:"2px dashed #d1d5db", borderRadius:"12px",
              background:"#f9fafb",
            }}>
              <div style={{ fontSize:"32px", marginBottom:"8px" }}>🖼️</div>
              <p style={{ fontSize:"13px", fontWeight:600, color:"#6b7280" }}>Tap untuk upload banner</p>
              <p style={{ fontSize:"11px", color:"#9ca3af", marginTop:"4px" }}>JPG, PNG • Maks 5MB</p>
              <input type="file" accept="image/*" onChange={e=>handleImageSelect(e,"banner")} style={{ display:"none" }} />
            </label>
          )}
        </div>

        {/* ===== LOGO UPLOAD ===== */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>🏷️ Logo Toko</label>
          <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"10px" }}>Logo persegi yang tampil di profil toko. Rekomendasi 400x400 pixel.</p>

          <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
            {logoPreview ? (
              <div style={{ position:"relative" }}>
                <img src={logoPreview} alt="Logo" style={{ width:"80px", height:"80px", borderRadius:"16px", objectFit:"cover", display:"block", border:"2px solid #e5e7eb" }} />
                <button onClick={removeLogo} style={{
                  position:"absolute", top:"-6px", right:"-6px",
                  width:"22px", height:"22px", borderRadius:"50%",
                  background:"#ef4444", color:"white", border:"2px solid white",
                  cursor:"pointer", fontSize:"10px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>✕</button>
              </div>
            ) : (
              <label style={{
                width:"80px", height:"80px", borderRadius:"16px",
                border:"2px dashed #d1d5db", cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", background:"#f9fafb", flexShrink:0,
              }}>
                <div style={{ fontSize:"24px" }}>📷</div>
                <span style={{ fontSize:"9px", color:"#9ca3af", marginTop:"2px" }}>Upload</span>
                <input type="file" accept="image/*" onChange={e=>handleImageSelect(e,"logo")} style={{ display:"none" }} />
              </label>
            )}
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"12px", color:"#6b7280", lineHeight:1.5 }}>
                {logoPreview ? "Logo sudah diupload ✅" : "Belum ada logo."}
              </p>
              {logoPreview && (
                <label style={{
                  display:"inline-block", marginTop:"6px",
                  padding:"6px 14px", borderRadius:"8px",
                  background:"#f3f4f6", fontSize:"12px", fontWeight:600,
                  color:"#374151", cursor:"pointer",
                }}>
                  📷 Ganti Logo
                  <input type="file" accept="image/*" onChange={e=>handleImageSelect(e,"logo")} style={{ display:"none" }} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Emoji (fallback jika tidak ada banner/logo) */}
        <div style={{ background:"white", borderRadius:"14px", padding:"14px" }}>
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>
            {bannerPreview || logoPreview ? "🎨 Ikon Emoji (backup)" : "🎨 Ikon Toko"}
          </label>
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
          <label style={{ fontSize:"13px", fontWeight:600, color:"#6b7280", marginBottom:"8px", display:"block" }}>📂 Kategori</label>
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
              <div><p style={{ fontSize:"13px", color:"#10b981", fontWeight:600 }}>✅ Sudah diatur</p><p style={{ fontSize:"11px", color:"#9ca3af" }}>{store.lat.toFixed(4)}, {store.lng.toFixed(4)}</p></div>
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

        {/* Upload Progress */}
        {uploadMsg && <p style={{ textAlign:"center", fontSize:"13px", color:"#f59e0b", fontWeight:600 }}>⏳ {uploadMsg}</p>}

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

      {showLoc && <LocationPicker initialLat={store?.lat} initialLng={store?.lng}
        onSelect={(pos, addr) => { saveLocation(pos); setForm(f=>({...f,alamat:addr.split(",").slice(0,3).join(",")})); }}
        onClose={()=>setShowLoc(false)} />}

      <BottomNav role="seller" active="profile" />
    </div>
  );
}
`);

// =============================================
// 2. BUYER HOME — Tampilkan Banner & Logo Toko
// =============================================
const buyerHomePath = "app/buyer/page.js";
if (fs.existsSync(buyerHomePath)) {
  let content = fs.readFileSync(buyerHomePath, "utf-8");

  // Ganti bagian store card banner agar support gambar
  const oldBanner = 'storeEmojis[s.kategori?.toLowerCase()]||s.emoji||"🏪"';
  if (content.includes(oldBanner) && !content.includes("s.banner")) {
    // Replace store card rendering
    content = content.replace(
      /height:"120px", background:gradients\[idx%gradients\.length\], display:"flex", alignItems:"center", justifyContent:"center", fontSize:"50px", position:"relative".*?\n.*?{storeEmojis\[s\.kategori\?\.toLowerCase\(\)\]\|\|s\.emoji\|\|"🏪"}/,
      `height:"120px",
                    background: s.banner ? "url("+s.banner+") center/cover no-repeat" : gradients[idx%gradients.length],
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"50px", position:"relative",
                  }}>
                    {!s.banner && (storeEmojis[s.kategori?.toLowerCase()]||s.emoji||"🏪")}
                    {s.logo && <div style={{ position:"absolute", bottom:"-16px", left:"12px", width:"40px", height:"40px", borderRadius:"12px", border:"2px solid white", background:"url("+s.logo+") center/cover no-repeat", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}></div>}`
    );

    // Adjust padding jika ada logo
    content = content.replace(
      'padding:"14px 16px" }}>\n                    <h4',
      'padding: s.logo ? "24px 16px 14px" : "14px 16px" }}>\n                    <h4'
    );

    fs.writeFileSync(buyerHomePath, content);
    console.log("  ✅ " + buyerHomePath + " (banner & logo di store cards)");
  } else {
    console.log("  ℹ️ " + buyerHomePath + " (sudah ada atau pattern berbeda)");
  }
}

// =============================================
// 3. BUYER TOKO DETAIL — Tampilkan Banner & Logo
// =============================================
const tokoDetailPath = "app/buyer/toko/[id]/page.js";
if (fs.existsSync(tokoDetailPath)) {
  let content = fs.readFileSync(tokoDetailPath, "utf-8");

  // Ganti banner di detail toko
  if (!content.includes("store.banner")) {
    content = content.replace(
      /height:"200px",\s*background:"linear-gradient\(135deg, #fef3c7, #fed7aa, #fecaca\)",\s*display:"flex", alignItems:"center", justifyContent:"center", fontSize:"80px",\s*\}\}>{store\.emoji \|\| "🏪"}/,
      `height:"200px",
          background: store.banner ? "url("+store.banner+") center/cover no-repeat" : "linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"80px",
        }}>{!store.banner && (store.emoji || "🏪")}
          {store.logo && <div style={{ position:"absolute", bottom:"-28px", left:"20px", width:"60px", height:"60px", borderRadius:"18px", border:"3px solid white", background:"url("+store.logo+") center/cover no-repeat", boxShadow:"0 4px 12px rgba(0,0,0,0.12)", zIndex:6 }}></div>}`
    );

    // Adjust store info card padding
    content = content.replace(
      'margin: "-20px 16px 0"',
      'margin: "-20px 16px 0", paddingTop: store.logo ? "36px" : "20px"'
    );

    fs.writeFileSync(tokoDetailPath, content);
    console.log("  ✅ " + tokoDetailPath + " (banner & logo di detail)");
  } else {
    console.log("  ℹ️ " + tokoDetailPath + " (sudah ada banner)");
  }
}

// =============================================
// 4. Update Firebase Storage Rules info
// =============================================
writeFile("FIREBASE-STORAGE-RULES.md", `
# 📸 Firebase Storage Rules (UPDATE)

Buka Firebase Console → Storage → Rules
Ganti isinya dengan ini:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /produk/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /toko-banners/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /toko-logos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}

Klik Publish.
`);

console.log("");
console.log("🎉 ========================================");
console.log("   BANNER & LOGO TOKO SELESAI!");
console.log("========================================");
console.log("");
console.log("   ✅ Upload banner toko (gambar lebar)");
console.log("   ✅ Upload logo toko (persegi)");
console.log("   ✅ Live preview saat edit");
console.log("   ✅ Ganti & hapus banner/logo");
console.log("   ✅ Banner tampil di home pembeli (store card)");
console.log("   ✅ Banner + logo tampil di detail toko");
console.log("   ✅ Fallback ke emoji jika tidak ada banner");
console.log("   ✅ Logo overlay di pojok kiri bawah banner");
console.log("");
console.log("   ⚠️  PENTING: Update Firebase Storage Rules!");
console.log("   Baca file FIREBASE-STORAGE-RULES.md");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Deploy:  git add . && git commit -m 'banner logo toko' && git push");
console.log("");
