"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
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

  async function submit(e) {
    e.preventDefault();
    if(!storeId||!form.nama.trim()||!form.harga) return;
    setSaving(true);
    const d = { tokoId:storeId, nama:form.nama.trim(), harga:parseInt(form.harga), deskripsi:form.deskripsi.trim(), emoji:form.emoji, kategori:form.kategori, tersedia:true };
    try {
      if(editId) { await updateDoc(doc(db,"produk",editId),d); setProducts(p=>p.map(x=>x.id===editId?{...x,...d}:x)); }
      else { const nd = await addDoc(collection(db,"produk"),d); setProducts(p=>[...p,{id:nd.id,...d}]); }
      reset();
    } catch(e){ alert("Gagal simpan."); }
    setSaving(false);
  }

  function reset() { setForm({nama:"",harga:"",deskripsi:"",emoji:"🍚",kategori:"makanan"}); setEditId(null); setShowForm(false); }
  function edit(p) { setForm({nama:p.nama,harga:String(p.harga),deskripsi:p.deskripsi||"",emoji:p.emoji||"🍚",kategori:p.kategori||"makanan"}); setEditId(p.id); setShowForm(true); }
  async function del(id) { if(!confirm("Hapus produk ini?")) return; await deleteDoc(doc(db,"produk",id)); setProducts(p=>p.filter(x=>x.id!==id)); }
  async function toggle(id,c) { await updateDoc(doc(db,"produk",id),{tersedia:!c}); setProducts(p=>p.map(x=>x.id===id?{...x,tersedia:!c}:x)); }

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
          <h1 style={{ fontSize:"18px", fontWeight:900, color:"#1f2937" }}>Produk Saya</h1>
        </div>
        <button onClick={()=>{reset();setShowForm(true);}} style={{
          padding:"10px 20px", borderRadius:"12px",
          background:"linear-gradient(135deg, #f59e0b, #ea580c)",
          color:"white", border:"none", fontWeight:700, fontSize:"14px",
          cursor:"pointer", boxShadow:"0 4px 12px rgba(245,158,11,0.3)",
        }}>+ Tambah</button>
      </div>

      {/* ===== ADD/EDIT FORM (Full Screen Modal) ===== */}
      {showForm && (
        <div style={{
          position:"fixed", inset:0, zIndex:999,
          background:"rgba(0,0,0,0.5)",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
        }} onClick={(e) => { if(e.target === e.currentTarget) reset(); }}>
          <div style={{
            background:"white", width:"100%", maxWidth:"480px",
            borderRadius:"24px 24px 0 0", padding:"24px 20px 32px",
            maxHeight:"90vh", overflowY:"auto",
            animation:"slideUp 0.3s ease",
          }}>
            {/* Modal Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h2 style={{ fontSize:"20px", fontWeight:900, color:"#1f2937" }}>
                {editId ? "✏️ Edit Produk" : "📦 Tambah Produk Baru"}
              </h2>
              <button onClick={reset} style={{
                width:"36px", height:"36px", borderRadius:"50%",
                background:"#f3f4f6", border:"none", cursor:"pointer",
                fontSize:"18px", display:"flex", alignItems:"center", justifyContent:"center",
              }}>✕</button>
            </div>

            <form onSubmit={submit}>
              {/* Emoji Picker */}
              <div style={{ marginBottom:"20px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"10px", display:"block" }}>
                  Pilih Ikon Produk
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:"8px" }}>
                  {emojiList.map(e => (
                    <button key={e} type="button" onClick={()=>setForm(f=>({...f,emoji:e}))} style={{
                      width:"100%", aspectRatio:"1", borderRadius:"12px", border:"none",
                      fontSize:"22px", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: form.emoji===e ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "#f9fafb",
                      boxShadow: form.emoji===e ? "0 0 0 2px #f59e0b" : "none",
                      transition:"all 0.15s",
                    }}>{e}</button>
                  ))}
                </div>
              </div>

              {/* Nama Produk */}
              <div style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"8px", display:"block" }}>
                  Nama Produk <span style={{color:"#ef4444"}}>*</span>
                </label>
                <input required value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}
                  placeholder="Contoh: Nasi Goreng Spesial" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>

              {/* Harga */}
              <div style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"8px", display:"block" }}>
                  Harga (Rp) <span style={{color:"#ef4444"}}>*</span>
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
              <div style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"8px", display:"block" }}>
                  Kategori
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                  {kategoriList.map(k => (
                    <button key={k.value} type="button" onClick={()=>setForm(f=>({...f,kategori:k.value}))} style={{
                      padding:"12px", borderRadius:"12px", border:"none",
                      fontSize:"13px", fontWeight:600, cursor:"pointer",
                      textAlign:"center",
                      background: form.kategori===k.value ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "#f9fafb",
                      color: form.kategori===k.value ? "#d97706" : "#6b7280",
                      boxShadow: form.kategori===k.value ? "0 0 0 2px #f59e0b" : "none",
                      transition:"all 0.15s",
                    }}>{k.label}</button>
                  ))}
                </div>
              </div>

              {/* Deskripsi */}
              <div style={{ marginBottom:"24px" }}>
                <label style={{ fontSize:"14px", fontWeight:600, color:"#374151", marginBottom:"8px", display:"block" }}>
                  Deskripsi <span style={{color:"#9ca3af", fontWeight:400}}>(opsional)</span>
                </label>
                <textarea value={form.deskripsi} onChange={e=>setForm(f=>({...f,deskripsi:e.target.value}))}
                  placeholder="Jelaskan produk Anda..." rows={3}
                  style={{...inputStyle, resize:"none", lineHeight:"1.5"}}
                  onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>

              {/* Preview */}
              <div style={{ background:"#f9fafb", borderRadius:"14px", padding:"14px", marginBottom:"20px", display:"flex", gap:"12px", alignItems:"center" }}>
                <div style={{ width:"56px", height:"56px", borderRadius:"14px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", flexShrink:0 }}>{form.emoji}</div>
                <div>
                  <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"2px" }}>Preview:</p>
                  <h4 style={{ fontSize:"15px", fontWeight:700, color:"#1f2937" }}>{form.nama || "Nama Produk"}</h4>
                  <p style={{ fontSize:"14px", fontWeight:800, color:"#f59e0b", marginTop:"2px" }}>Rp {form.harga ? parseInt(form.harga).toLocaleString("id") : "0"}</p>
                </div>
              </div>

              {/* Submit Button */}
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

      {/* ===== PRODUCT LIST ===== */}
      <div style={{ padding:"16px 20px" }}>
        {/* Count */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
          <p style={{ fontSize:"14px", color:"#6b7280" }}>Total: <span style={{ fontWeight:700, color:"#1f2937" }}>{products.length} produk</span></p>
        </div>

        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {[1,2,3].map(i => <div key={i} style={{ background:"white", borderRadius:"14px", padding:"16px" }}><div className="skeleton" style={{ height:"56px" }}></div></div>)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", background:"white", borderRadius:"20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize:"56px", marginBottom:"12px" }}>📦</div>
            <h3 style={{ fontSize:"18px", fontWeight:700, color:"#374151" }}>Belum Ada Produk</h3>
            <p style={{ fontSize:"13px", color:"#9ca3af", marginTop:"4px", marginBottom:"20px" }}>Tambah produk pertama Anda!</p>
            <button onClick={()=>{reset();setShowForm(true);}} style={{
              padding:"12px 28px", borderRadius:"12px",
              background:"linear-gradient(135deg, #f59e0b, #ea580c)",
              color:"white", border:"none", fontWeight:700, fontSize:"14px", cursor:"pointer",
            }}>+ Tambah Produk</button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {products.map(p => (
              <div key={p.id} style={{
                background:"white", borderRadius:"16px", padding:"14px",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
                opacity: p.tersedia !== false ? 1 : 0.5,
                transition:"opacity 0.2s",
              }}>
                <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                  {/* Emoji */}
                  <div style={{
                    width:"56px", height:"56px", borderRadius:"14px",
                    background:"#fef3c7", display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:"28px", flexShrink:0,
                  }}>{p.emoji||"📦"}</div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <h4 style={{ fontSize:"15px", fontWeight:600, color:"#1f2937", marginBottom:"2px" }}>{p.nama}</h4>
                    <p style={{ fontSize:"15px", fontWeight:800, color:"#f59e0b" }}>Rp {(p.harga||0).toLocaleString("id")}</p>
                    {p.kategori && <span style={{ fontSize:"11px", color:"#9ca3af", background:"#f3f4f6", padding:"2px 8px", borderRadius:"10px", marginTop:"4px", display:"inline-block" }}>{p.kategori}</span>}
                  </div>

                  {/* Toggle */}
                  <button onClick={()=>toggle(p.id,p.tersedia)} style={{
                    width:"44px", height:"26px", borderRadius:"50px", position:"relative",
                    background: p.tersedia!==false ? "#10b981" : "#d1d5db",
                    border:"none", cursor:"pointer", transition:"background 0.2s", flexShrink:0,
                  }}>
                    <div style={{
                      width:"20px", height:"20px", borderRadius:"50%", background:"white",
                      position:"absolute", top:"3px",
                      left: p.tersedia!==false ? "21px" : "3px",
                      transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
                    }}></div>
                  </button>
                </div>

                {/* Action buttons */}
                <div style={{ display:"flex", gap:"8px", marginTop:"12px", paddingTop:"12px", borderTop:"1px solid #f3f4f6" }}>
                  <button onClick={()=>edit(p)} style={{
                    flex:1, padding:"10px", borderRadius:"10px", background:"#f3f4f6",
                    border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:"#374151",
                  }}>✏️ Edit</button>
                  <button onClick={()=>del(p.id)} style={{
                    flex:1, padding:"10px", borderRadius:"10px", background:"#fef2f2",
                    border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:"#ef4444",
                  }}>🗑️ Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB (Floating Add Button) for mobile */}
      {products.length > 0 && !showForm && (
        <button onClick={()=>{reset();setShowForm(true);}} style={{
          position:"fixed", bottom:"88px", right:"20px", zIndex:50,
          width:"56px", height:"56px", borderRadius:"50%",
          background:"linear-gradient(135deg, #f59e0b, #ea580c)",
          color:"white", border:"none", cursor:"pointer",
          fontSize:"28px", fontWeight:300,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 6px 20px rgba(234,88,12,0.4)",
        }}>+</button>
      )}

      <BottomNav role="seller" active="products" />
    </div>
  );
}
