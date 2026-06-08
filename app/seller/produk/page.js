"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BottomNav from "@/components/BottomNav";
import ShareAllProducts from "@/components/ShareAllProducts";
import ShareProduct from "@/components/ShareProduct";

const emojiList = ["🍚","🍜","🍗","🥘","🧁","🍰","🥤","☕","🧃","👕","🧴","📦","🌿","🍳","🥗","🍲","🍕","🍔","🌮","🥪","🍱","🧆","🥞","🍿"];
const kategoriList = [
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
  const [shareProduct, setShareProduct] = useState(null);
  const [showShareAll, setShowShareAll] = useState(false);
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
          <button onClick={()=>setShowShareAll(true)} style={{ padding:"10px 14px", borderRadius:"12px", background:"white", border:"2px solid #f59e0b", color:"#d97706", fontWeight:700, fontSize:"13px", cursor:"pointer" }}>📤</button>
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
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px", maxHeight:"200px", overflowY:"auto" }}>
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
                  <button onClick={()=>setShareProduct(p)} style={{ flex:1, padding:"8px", borderRadius:"10px", background:"#dbeafe", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:"#2563eb" }}>📤 Share</button>
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

      {shareProduct && <ShareProduct product={shareProduct} tokoNama="" onClose={()=>setShareProduct(null)} />}
      {showShareAll && <ShareAllProducts products={products} tokoNama="" tokoId={storeId} onClose={()=>setShowShareAll(false)} />}
      <BottomNav role="seller" active="products" />
    </div>
  );
}
