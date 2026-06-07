// ============================================
// 📸 LOMAN - Tambah Upload Foto Produk
// ============================================
// Jalankan: node tambah-foto-produk.js
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
console.log("📸 ========================================");
console.log("   Tambah Upload Foto Produk + Katalog");
console.log("========================================");
console.log("");

// =============================================
// 1. SELLER PRODUK — Dengan Upload Foto
// =============================================
writeFile("app/seller/produk/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BottomNav from "@/components/BottomNav";

const emojiList = ["🍚","🍜","🍗","🥘","🧁","🍰","🥤","☕","🧃","👕","🧴","📦","🌿","🍳","🥗","🍲","🍕","🍔","🌮","🥪","🍱","🧆","🥞","🍿"];
const kategoriList = [
  { value:"makanan", label:"🍚 Makanan" },
  { value:"kue", label:"🧁 Kue & Snack" },
  { value:"minuman", label:"🥤 Minuman" },
  { value:"laundry", label:"👕 Laundry" },
  { value:"kebutuhan", label:"🧴 Kebutuhan" },
  { value:"lainnya", label:"📦 Lainnya" },
];

export default function KelolaProduk() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [storeId, setStoreId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nama:"", harga:"", deskripsi:"", emoji:"🍚", kategori:"makanan" });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        if(!sq.empty) {
          const sid=sq.docs[0].id; setStoreId(sid);
          const pq = await getDocs(query(collection(db,"produk"),where("tokoId","==",sid)));
          setProducts(pq.docs.map(d=>({id:d.id,...d.data()})));
        }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Ukuran foto maksimal 5MB"); return; }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function uploadFoto(file) {
    if (!file) return null;
    setUploadProgress("Mengupload foto...");
    try {
      const filename = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storageRef = ref(storage, "produk/" + filename);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setUploadProgress("");
      return url;
    } catch (e) {
      console.error("Upload error:", e);
      setUploadProgress("Gagal upload foto");
      return null;
    }
  }

  async function submit(e) {
    e.preventDefault();
    if(!storeId||!form.nama.trim()||!form.harga) return;
    setSaving(true);

    let fotoUrl = null;
    if (fotoFile) {
      fotoUrl = await uploadFoto(fotoFile);
    }

    const d = {
      tokoId:storeId, nama:form.nama.trim(), harga:parseInt(form.harga),
      deskripsi:form.deskripsi.trim(), emoji:form.emoji, kategori:form.kategori,
      tersedia:true,
      ...(fotoUrl && { foto: fotoUrl }),
    };

    try {
      if(editId) {
        await updateDoc(doc(db,"produk",editId),d);
        setProducts(p=>p.map(x=>x.id===editId?{...x,...d}:x));
      } else {
        const nd = await addDoc(collection(db,"produk"),d);
        setProducts(p=>[...p,{id:nd.id,...d}]);
      }
      reset();
    } catch(e){ alert("Gagal simpan."); }
    setSaving(false);
  }

  function reset() {
    setForm({nama:"",harga:"",deskripsi:"",emoji:"🍚",kategori:"makanan"});
    setEditId(null); setShowForm(false);
    setFotoFile(null); setFotoPreview(null); setUploadProgress("");
  }

  function edit(p) {
    setForm({nama:p.nama,harga:String(p.harga),deskripsi:p.deskripsi||"",emoji:p.emoji||"🍚",kategori:p.kategori||"makanan"});
    setEditId(p.id); setShowForm(true);
    setFotoPreview(p.foto || null); setFotoFile(null);
  }

  async function del(id) {
    if(!confirm("Hapus produk ini?")) return;
    await deleteDoc(doc(db,"produk",id));
    setProducts(p=>p.filter(x=>x.id!==id));
  }

  async function toggle(id,c) {
    await updateDoc(doc(db,"produk",id),{tersedia:!c});
    setProducts(p=>p.map(x=>x.id===id?{...x,tersedia:!c}:x));
  }

  const inputStyle = {
    width:"100%", padding:"14px 16px", border:"2px solid #e5e7eb",
    borderRadius:"14px", fontSize:"15px", outline:"none",
    background:"#f9fafb", WebkitAppearance:"none", transition:"border-color 0.2s",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>

      {/* Header */}
      <div style={{
        background:"white", padding:"16px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:"1px solid #f3f4f6",
        position:"sticky", top:0, zIndex:50,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <button onClick={()=>router.push("/seller")} style={{
            width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb",
            background:"white", cursor:"pointer", fontSize:"16px",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>←</button>
          <h1 style={{ fontSize:"18px", fontWeight:900 }}>Produk Saya</h1>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          {/* View toggle */}
          <button onClick={()=>setViewMode(v=>v==="list"?"grid":"list")} style={{
            width:"36px", height:"36px", borderRadius:"10px", border:"1px solid #e5e7eb",
            background:"white", cursor:"pointer", fontSize:"16px",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>{viewMode === "list" ? "▦" : "☰"}</button>
          <button onClick={()=>{reset();setShowForm(true);}} style={{
            padding:"10px 16px", borderRadius:"12px",
            background:"linear-gradient(135deg, #f59e0b, #ea580c)",
            color:"white", border:"none", fontWeight:700, fontSize:"14px",
            cursor:"pointer", boxShadow:"0 4px 12px rgba(245,158,11,0.3)",
          }}>+ Tambah</button>
        </div>
      </div>

      {/* ===== ADD/EDIT FORM ===== */}
      {showForm && (
        <div style={{
          position:"fixed", inset:0, zIndex:999,
          background:"rgba(0,0,0,0.5)",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
        }} onClick={e => { if(e.target === e.currentTarget) reset(); }}>
          <div style={{
            background:"white", width:"100%", maxWidth:"480px",
            borderRadius:"24px 24px 0 0", padding:"24px 20px 32px",
            maxHeight:"92vh", overflowY:"auto",
            animation:"slideUp 0.3s ease",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h2 style={{ fontSize:"20px", fontWeight:900 }}>{editId ? "✏️ Edit Produk" : "📦 Produk Baru"}</h2>
              <button onClick={reset} style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"18px" }}>✕</button>
            </div>

            <form onSubmit={submit}>

              {/* ===== FOTO UPLOAD ===== */}
              <div style={{ marginBottom:"20px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"10px", display:"block" }}>📸 Foto Produk</label>
                <div style={{
                  width:"100%", borderRadius:"16px", overflow:"hidden",
                  border:"2px dashed #d1d5db", position:"relative",
                  background: fotoPreview ? "transparent" : "#f9fafb",
                  cursor:"pointer",
                }}>
                  {fotoPreview ? (
                    <div style={{ position:"relative" }}>
                      <img src={fotoPreview} alt="Preview" style={{
                        width:"100%", height:"200px", objectFit:"cover", display:"block",
                      }} />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFotoFile(null); setFotoPreview(null); }} style={{
                        position:"absolute", top:"8px", right:"8px",
                        width:"32px", height:"32px", borderRadius:"50%",
                        background:"rgba(0,0,0,0.6)", color:"white", border:"none",
                        cursor:"pointer", fontSize:"14px",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>✕</button>
                      <label style={{
                        position:"absolute", bottom:"8px", right:"8px",
                        padding:"6px 14px", borderRadius:"20px",
                        background:"rgba(0,0,0,0.6)", color:"white",
                        fontSize:"12px", fontWeight:600, cursor:"pointer",
                      }}>
                        📷 Ganti Foto
                        <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display:"none" }} />
                      </label>
                    </div>
                  ) : (
                    <label style={{
                      display:"flex", flexDirection:"column", alignItems:"center",
                      justifyContent:"center", padding:"32px 20px", cursor:"pointer",
                    }}>
                      <div style={{ fontSize:"40px", marginBottom:"8px" }}>📷</div>
                      <p style={{ fontSize:"14px", fontWeight:600, color:"#6b7280" }}>Tap untuk upload foto</p>
                      <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"4px" }}>JPG, PNG • Maks 5MB</p>
                      <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display:"none" }} />
                    </label>
                  )}
                </div>
                {uploadProgress && <p style={{ fontSize:"12px", color:"#f59e0b", marginTop:"6px", textAlign:"center" }}>{uploadProgress}</p>}
                <p style={{ fontSize:"11px", color:"#9ca3af", marginTop:"6px", textAlign:"center" }}>
                  Foto opsional — jika tidak upload, akan tampil emoji di bawah
                </p>
              </div>

              {/* Emoji (Backup jika tidak ada foto) */}
              <div style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"8px", display:"block" }}>
                  🎨 Ikon Emoji {fotoPreview && <span style={{ color:"#9ca3af", fontWeight:400 }}>(tampil jika tidak ada foto)</span>}
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:"6px" }}>
                  {emojiList.map(e => (
                    <button key={e} type="button" onClick={()=>setForm(f=>({...f,emoji:e}))} style={{
                      width:"100%", aspectRatio:"1", borderRadius:"10px", border:"none",
                      fontSize:"20px", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: form.emoji===e ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "#f9fafb",
                      boxShadow: form.emoji===e ? "0 0 0 2px #f59e0b" : "none",
                    }}>{e}</button>
                  ))}
                </div>
              </div>

              {/* Nama */}
              <div style={{ marginBottom:"14px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"6px", display:"block" }}>
                  Nama Produk <span style={{color:"#ef4444"}}>*</span>
                </label>
                <input required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}
                  placeholder="Nasi Goreng Spesial" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>

              {/* Harga */}
              <div style={{ marginBottom:"14px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"6px", display:"block" }}>
                  Harga <span style={{color:"#ef4444"}}>*</span>
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:"16px", top:"50%", transform:"translateY(-50%)", fontSize:"14px", color:"#9ca3af", fontWeight:600 }}>Rp</span>
                  <input type="number" inputMode="numeric" required value={form.harga}
                    onChange={e=>setForm(f=>({...f,harga:e.target.value}))} placeholder="15000"
                    style={{...inputStyle, paddingLeft:"44px"}}
                    onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
                </div>
              </div>

              {/* Kategori */}
              <div style={{ marginBottom:"14px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"8px", display:"block" }}>Kategori</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
                  {kategoriList.map(k => (
                    <button key={k.value} type="button" onClick={()=>setForm(f=>({...f,kategori:k.value}))} style={{
                      padding:"10px", borderRadius:"10px", border:"none",
                      fontSize:"13px", fontWeight:600, cursor:"pointer", textAlign:"center",
                      background: form.kategori===k.value ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "#f9fafb",
                      color: form.kategori===k.value ? "#d97706" : "#6b7280",
                      boxShadow: form.kategori===k.value ? "0 0 0 2px #f59e0b" : "none",
                    }}>{k.label}</button>
                  ))}
                </div>
              </div>

              {/* Deskripsi */}
              <div style={{ marginBottom:"20px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"6px", display:"block" }}>
                  Deskripsi <span style={{color:"#9ca3af",fontWeight:400}}>(opsional)</span>
                </label>
                <textarea value={form.deskripsi} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))}
                  placeholder="Bahan, porsi, level pedas, dll..." rows={3}
                  style={{...inputStyle, resize:"none", lineHeight:"1.5"}}
                  onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>

              {/* Preview Card */}
              <div style={{ background:"#f9fafb", borderRadius:"14px", padding:"12px", marginBottom:"16px" }}>
                <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"8px" }}>Preview tampilan di pembeli:</p>
                <div style={{ display:"flex", gap:"12px", alignItems:"center", background:"white", borderRadius:"12px", padding:"10px" }}>
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="" style={{ width:"60px", height:"60px", borderRadius:"12px", objectFit:"cover" }} />
                  ) : (
                    <div style={{ width:"60px", height:"60px", borderRadius:"12px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", flexShrink:0 }}>{form.emoji}</div>
                  )}
                  <div>
                    <h4 style={{ fontSize:"14px", fontWeight:700, color:"#1f2937" }}>{form.nama || "Nama Produk"}</h4>
                    {form.deskripsi && <p style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>{form.deskripsi.slice(0,50)}{form.deskripsi.length>50?"...":""}</p>}
                    <p style={{ fontSize:"15px", fontWeight:800, color:"#f59e0b", marginTop:"2px" }}>Rp {form.harga ? parseInt(form.harga).toLocaleString("id") : "0"}</p>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving||!form.nama.trim()||!form.harga} style={{
                width:"100%", padding:"16px", borderRadius:"14px", border:"none",
                background: (saving||!form.nama.trim()||!form.harga) ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
                color:"white", fontWeight:800, fontSize:"16px",
                cursor: (saving||!form.nama.trim()||!form.harga) ? "default" : "pointer",
                boxShadow: (saving||!form.nama.trim()||!form.harga) ? "none" : "0 4px 16px rgba(245,158,11,0.3)",
              }}>{saving ? "Menyimpan... ⏳" : editId ? "💾 Simpan Perubahan" : "✅ Tambah Produk"}</button>
            </form>
          </div>
        </div>
      )}

      {/* ===== PRODUCT LIST / GRID ===== */}
      <div style={{ padding:"16px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
          <p style={{ fontSize:"14px", color:"#6b7280" }}>Total: <span style={{ fontWeight:700, color:"#1f2937" }}>{products.length} produk</span></p>
        </div>

        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {[1,2,3].map(i => <div key={i} style={{ background:"white", borderRadius:"14px", padding:"16px" }}><div className="skeleton" style={{ height:"60px" }}></div></div>)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", background:"white", borderRadius:"20px" }}>
            <div style={{ fontSize:"56px", marginBottom:"12px" }}>📦</div>
            <h3 style={{ fontSize:"18px", fontWeight:700, color:"#374151" }}>Belum Ada Produk</h3>
            <p style={{ fontSize:"13px", color:"#9ca3af", marginTop:"4px", marginBottom:"20px" }}>Tambah produk pertama Anda!</p>
            <button onClick={()=>{reset();setShowForm(true);}} style={{
              padding:"12px 28px", borderRadius:"12px",
              background:"linear-gradient(135deg, #f59e0b, #ea580c)",
              color:"white", border:"none", fontWeight:700, fontSize:"14px", cursor:"pointer",
            }}>+ Tambah Produk</button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            {products.map(p => (
              <div key={p.id} style={{
                background:"white", borderRadius:"16px", overflow:"hidden",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
                opacity: p.tersedia !== false ? 1 : 0.5,
              }}>
                {p.foto ? (
                  <img src={p.foto} alt={p.nama} style={{ width:"100%", height:"120px", objectFit:"cover" }} />
                ) : (
                  <div style={{ width:"100%", height:"120px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"40px" }}>{p.emoji||"📦"}</div>
                )}
                <div style={{ padding:"10px 12px" }}>
                  <h4 style={{ fontSize:"13px", fontWeight:600, color:"#1f2937", marginBottom:"2px", overflow:"hidden", display:"-webkit-box", WebkitBoxOrient:"vertical", WebkitLineClamp:1 }}>{p.nama}</h4>
                  <p style={{ fontSize:"14px", fontWeight:800, color:"#f59e0b" }}>Rp {(p.harga||0).toLocaleString("id")}</p>
                  <div style={{ display:"flex", gap:"6px", marginTop:"8px" }}>
                    <button onClick={()=>edit(p)} style={{ flex:1, padding:"6px", borderRadius:"8px", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:600, color:"#374151" }}>✏️</button>
                    <button onClick={()=>del(p.id)} style={{ flex:1, padding:"6px", borderRadius:"8px", background:"#fef2f2", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:600, color:"#ef4444" }}>🗑️</button>
                    <button onClick={()=>toggle(p.id,p.tersedia)} style={{
                      padding:"6px 10px", borderRadius:"8px", border:"none", cursor:"pointer",
                      fontSize:"11px", fontWeight:600,
                      background: p.tersedia!==false ? "#d1fae5" : "#f3f4f6",
                      color: p.tersedia!==false ? "#059669" : "#9ca3af",
                    }}>{p.tersedia!==false ? "✓ Aktif" : "✗ Off"}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {products.map(p => (
              <div key={p.id} style={{
                background:"white", borderRadius:"16px", padding:"12px",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
                opacity: p.tersedia !== false ? 1 : 0.5,
              }}>
                <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                  {p.foto ? (
                    <img src={p.foto} alt={p.nama} style={{ width:"64px", height:"64px", borderRadius:"14px", objectFit:"cover", flexShrink:0 }} />
                  ) : (
                    <div style={{ width:"64px", height:"64px", borderRadius:"14px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", flexShrink:0 }}>{p.emoji||"📦"}</div>
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <h4 style={{ fontSize:"15px", fontWeight:600, color:"#1f2937", marginBottom:"2px" }}>{p.nama}</h4>
                    {p.deskripsi && <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"2px", overflow:"hidden", display:"-webkit-box", WebkitBoxOrient:"vertical", WebkitLineClamp:1 }}>{p.deskripsi}</p>}
                    <p style={{ fontSize:"15px", fontWeight:800, color:"#f59e0b" }}>Rp {(p.harga||0).toLocaleString("id")}</p>
                  </div>
                  <button onClick={()=>toggle(p.id,p.tersedia)} style={{
                    width:"44px", height:"26px", borderRadius:"50px", position:"relative",
                    background: p.tersedia!==false ? "#10b981" : "#d1d5db",
                    border:"none", cursor:"pointer", flexShrink:0,
                  }}>
                    <div style={{
                      width:"20px", height:"20px", borderRadius:"50%", background:"white",
                      position:"absolute", top:"3px",
                      left: p.tersedia!==false ? "21px" : "3px",
                      transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
                    }}></div>
                  </button>
                </div>
                <div style={{ display:"flex", gap:"8px", marginTop:"10px", paddingTop:"10px", borderTop:"1px solid #f3f4f6" }}>
                  <button onClick={()=>edit(p)} style={{ flex:1, padding:"8px", borderRadius:"10px", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:"#374151" }}>✏️ Edit</button>
                  <button onClick={()=>del(p.id)} style={{ flex:1, padding:"8px", borderRadius:"10px", background:"#fef2f2", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:"#ef4444" }}>🗑️ Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {products.length > 0 && !showForm && (
        <button onClick={()=>{reset();setShowForm(true);}} style={{
          position:"fixed", bottom:"88px", right:"20px", zIndex:50,
          width:"56px", height:"56px", borderRadius:"50%",
          background:"linear-gradient(135deg, #f59e0b, #ea580c)",
          color:"white", border:"none", cursor:"pointer", fontSize:"28px",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 6px 20px rgba(234,88,12,0.4)",
        }}>+</button>
      )}

      <BottomNav role="seller" active="products" />
    </div>
  );
}
`);

// =============================================
// 2. BUYER TOKO DETAIL — Tampil Foto Produk
// =============================================
writeFile("app/buyer/toko/[id]/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

export default function StoreDetail() {
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewFoto, setViewFoto] = useState(null);

  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem("loman_cart")||"[]")); } catch(e){} }, []);
  useEffect(() => { localStorage.setItem("loman_cart", JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    async function f() {
      try {
        const sd = await getDoc(doc(db, "toko", params.id));
        if (sd.exists()) setStore({ id: sd.id, ...sd.data() });
        const ps = await getDocs(query(collection(db, "produk"), where("tokoId", "==", params.id)));
        setProducts(ps.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.tersedia !== false));
      } catch(e) { console.error(e); }
      setLoading(false);
    }
    if (params.id) f();
  }, [params.id]);

  function addToCart(p) {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, nama: p.nama, harga: p.harga, emoji: p.emoji || "📦", tokoId: params.id, tokoNama: store?.nama || "", qty: 1 }];
    });
  }

  function removeFromCart(pid) {
    setCart(prev => {
      const ex = prev.find(i => i.id === pid);
      if (ex && ex.qty > 1) return prev.map(i => i.id === pid ? { ...i, qty: i.qty - 1 } : i);
      return prev.filter(i => i.id !== pid);
    });
  }

  const cartTotal = cart.reduce((s, i) => s + i.qty, 0);
  const cartPrice = cart.reduce((s, i) => s + i.harga * i.qty, 0);
  const gradients = ["#fef3c7","#dbeafe","#d1fae5","#fce7f3","#e0e7ff","#fee2e2"];

  if (loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:"48px"}}>🏪</div></div>;
  if (!store) return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}><div style={{fontSize:"56px",marginBottom:"16px"}}>😕</div><h2 style={{fontSize:"20px",fontWeight:700}}>Toko Tidak Ditemukan</h2><button onClick={()=>router.push("/buyer")} style={{marginTop:"16px",color:"#f59e0b",fontWeight:600,background:"none",border:"none",cursor:"pointer",fontSize:"15px"}}>← Kembali</button></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", paddingBottom: cartTotal > 0 ? "150px" : "80px" }}>

      {/* Foto Viewer Modal */}
      {viewFoto && (
        <div onClick={()=>setViewFoto(null)} style={{
          position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.9)",
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
        }}>
          <img src={viewFoto} alt="" style={{ maxWidth:"95%", maxHeight:"85vh", objectFit:"contain", borderRadius:"12px" }} />
          <button style={{ position:"absolute", top:"16px", right:"16px", width:"40px", height:"40px", borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"none", color:"white", fontSize:"20px", cursor:"pointer" }}>✕</button>
        </div>
      )}

      {/* Store Header */}
      <div style={{ position:"relative" }}>
        <button onClick={()=>router.push("/buyer")} style={{
          position:"absolute", top:"14px", left:"14px", zIndex:10,
          width:"38px", height:"38px", borderRadius:"50%",
          background:"rgba(255,255,255,0.95)", border:"none",
          cursor:"pointer", fontSize:"18px",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 2px 8px rgba(0,0,0,0.12)",
        }}>←</button>
        <div style={{
          height:"200px", background:"linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"80px",
        }}>{store.emoji || "🏪"}</div>
      </div>

      {/* Store Info Card */}
      <div style={{
        background:"white", margin:"-20px 16px 0", borderRadius:"20px",
        padding:"20px", position:"relative", zIndex:5,
        boxShadow:"0 4px 16px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:"22px", fontWeight:900, color:"#1f2937" }}>{store.nama}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"8px", flexWrap:"wrap" }}>
              <span style={{ padding:"4px 10px", borderRadius:"20px", background:"#fef3c7", fontSize:"12px", fontWeight:700, color:"#d97706" }}>⭐ {store.rating || "Baru"}</span>
              <span style={{ fontSize:"13px", color:"#6b7280" }}>📍 {store.alamat || "-"}</span>
            </div>
          </div>
          <div style={{
            padding:"6px 14px", borderRadius:"20px", fontSize:"12px", fontWeight:600,
            background: store.isOpen !== false ? "#d1fae5" : "#fee2e2",
            color: store.isOpen !== false ? "#065f46" : "#991b1b",
          }}>{store.isOpen !== false ? "● Buka" : "● Tutup"}</div>
        </div>
        <div style={{ display:"flex", gap:"16px", marginTop:"12px", paddingTop:"12px", borderTop:"1px solid #f3f4f6" }}>
          <span style={{ fontSize:"13px", color:"#6b7280" }}>🕐 {store.jamBuka||"08:00"} - {store.jamTutup||"20:00"}</span>
          <span style={{ fontSize:"13px", color:"#6b7280" }}>🛵 Gratis ongkir</span>
        </div>
        {store.deskripsi && <p style={{ fontSize:"13px", color:"#9ca3af", marginTop:"10px", lineHeight:1.5 }}>{store.deskripsi}</p>}
      </div>

      {/* Menu */}
      <div style={{ padding:"20px 16px 0" }}>
        <h3 style={{ fontSize:"18px", fontWeight:800, color:"#1f2937", marginBottom:"14px" }}>
          Menu <span style={{ color:"#9ca3af", fontWeight:400, fontSize:"14px" }}>({products.length})</span>
        </h3>

        {products.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px", background:"white", borderRadius:"16px" }}>
            <div style={{ fontSize:"48px", marginBottom:"8px" }}>📦</div>
            <p style={{ color:"#9ca3af" }}>Belum ada produk</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {products.map((p, i) => {
              const inCart = cart.find(c => c.id === p.id);
              return (
                <div key={p.id} style={{
                  background:"white", borderRadius:"16px",
                  overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
                }}>
                  {/* Foto produk (jika ada) */}
                  {p.foto && (
                    <div onClick={()=>setViewFoto(p.foto)} style={{ cursor:"pointer", position:"relative" }}>
                      <img src={p.foto} alt={p.nama} style={{
                        width:"100%", height:"160px", objectFit:"cover", display:"block",
                      }} />
                      <div style={{
                        position:"absolute", bottom:"8px", right:"8px",
                        padding:"4px 10px", borderRadius:"20px",
                        background:"rgba(0,0,0,0.5)", color:"white",
                        fontSize:"11px", fontWeight:600,
                      }}>🔍 Tap untuk zoom</div>
                    </div>
                  )}

                  <div style={{ padding:"14px", display:"flex", gap:"12px", alignItems:"center" }}>
                    {/* Emoji (hanya jika tidak ada foto) */}
                    {!p.foto && (
                      <div style={{
                        width:"70px", height:"70px", borderRadius:"14px",
                        background: gradients[i % gradients.length],
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"32px", flexShrink:0,
                      }}>{p.emoji || "📦"}</div>
                    )}

                    <div style={{ flex:1, minWidth:0 }}>
                      <h4 style={{ fontSize:"15px", fontWeight:700, color:"#1f2937", marginBottom:"4px" }}>{p.nama}</h4>
                      {p.deskripsi && <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"6px", lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitBoxOrient:"vertical", WebkitLineClamp:2 }}>{p.deskripsi}</p>}
                      <p style={{ fontSize:"17px", fontWeight:800, color:"#f59e0b" }}>Rp {(p.harga||0).toLocaleString("id")}</p>
                    </div>

                    {/* Add/Qty */}
                    {inCart ? (
                      <div style={{ display:"flex", alignItems:"center", gap:"4px", background:"#fff7ed", borderRadius:"12px", padding:"4px" }}>
                        <button onClick={()=>removeFromCart(p.id)} style={{ width:"32px", height:"32px", borderRadius:"10px", border:"none", background:"white", fontSize:"16px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 2px rgba(0,0,0,0.08)" }}>−</button>
                        <span style={{ fontWeight:800, fontSize:"15px", minWidth:"24px", textAlign:"center", color:"#d97706" }}>{inCart.qty}</span>
                        <button onClick={()=>addToCart(p)} style={{ width:"32px", height:"32px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", fontSize:"16px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                      </div>
                    ) : (
                      <button onClick={()=>addToCart(p)} style={{
                        width:"40px", height:"40px", borderRadius:"12px", border:"none",
                        background:"linear-gradient(135deg, #f59e0b, #ea580c)", color:"white",
                        fontSize:"22px", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow:"0 4px 12px rgba(245,158,11,0.3)",
                      }}>+</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {cartTotal > 0 && (
        <div style={{
          position:"fixed", bottom:"72px", left:"50%", transform:"translateX(-50%)",
          width:"100%", maxWidth:"450px", padding:"0 16px", zIndex:50,
        }}>
          <button onClick={()=>router.push("/buyer/keranjang")} style={{
            width:"100%", padding:"16px 20px", borderRadius:"18px",
            background:"linear-gradient(135deg, #f59e0b, #ea580c)",
            color:"white", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            boxShadow:"0 8px 30px rgba(234,88,12,0.35)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:800 }}>{cartTotal}</div>
              <span style={{ fontWeight:700, fontSize:"15px" }}>Lihat Keranjang</span>
            </div>
            <span style={{ fontWeight:800, fontSize:"16px" }}>Rp {cartPrice.toLocaleString("id")}</span>
          </button>
        </div>
      )}

      <BottomNav role="buyer" active="home" />
    </div>
  );
}
`);

// =============================================
// 3. Enable Firebase Storage di rules info
// =============================================
writeFile("FIREBASE-STORAGE-RULES.md", `
# 📸 Firebase Storage Rules

Buka Firebase Console → Storage → Rules
Ganti isinya dengan ini:

\\\`\\\`\\\`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /produk/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
\\\`\\\`\\\`

Klik Publish.
`);

console.log("");
console.log("🎉 ========================================");
console.log("   FOTO PRODUK + KATALOG SELESAI!");
console.log("========================================");
console.log("");
console.log("   ✅ Upload foto produk (kamera/galeri)");
console.log("   ✅ Preview foto sebelum upload");
console.log("   ✅ Ganti/hapus foto");
console.log("   ✅ Foto tampil di halaman pembeli");
console.log("   ✅ Tap foto untuk zoom (fullscreen)");
console.log("   ✅ Fallback ke emoji jika tidak ada foto");
console.log("   ✅ Grid view / List view toggle");
console.log("   ✅ Preview card saat mengisi form");
console.log("   ✅ Maks 5MB per foto");
console.log("");
console.log("   ⚠️  PENTING: Update Firebase Storage Rules!");
console.log("   Buka Firebase Console → Storage → Rules");
console.log("   Baca file FIREBASE-STORAGE-RULES.md");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Deploy:  git add . && git commit -m 'foto produk' && git push");
console.log("");
