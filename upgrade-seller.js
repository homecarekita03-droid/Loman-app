// ============================================
// 🏪 LOMAN - Upgrade Seller Pages (Mobile Friendly)
// ============================================
// Jalankan: node upgrade-seller.js
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
console.log("🏪 ========================================");
console.log("   Upgrade Seller Pages — Mobile Friendly");
console.log("========================================");
console.log("");

// =============================================
// 1. SELLER DASHBOARD — Full Redesign Mobile
// =============================================
writeFile("app/seller/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import ChatRoom from "@/components/ChatRoom";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, userData, loading: al } = useAuth();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ today: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [chatOrder, setChatOrder] = useState(null);

  useEffect(() => { if (!al && !user) router.push("/login"); }, [user, al, router]);

  useEffect(() => {
    async function f() {
      if (!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        let sid;
        if (sq.empty) {
          const nr = doc(collection(db,"toko"));
          const ns = { nama:"Toko "+(userData?.nama||"Saya"), pemilikId:user.uid, kategori:"makanan", deskripsi:"", alamat:userData?.alamat||"", jamBuka:"08:00", jamTutup:"20:00", emoji:"🏪", rating:0, isOpen:true, createdAt:new Date().toISOString() };
          await setDoc(nr, ns); setStore({id:nr.id,...ns}); sid=nr.id;
        } else { setStore({id:sq.docs[0].id,...sq.docs[0].data()}); sid=sq.docs[0].id; }
        const os = await getDocs(query(collection(db,"pesanan"),where("tokoId","==",sid)));
        const ol = os.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
        setOrders(ol);
        const td = new Date().toDateString();
        const to = ol.filter(o=>new Date(o.createdAt).toDateString()===td);
        setStats({ today:to.length, revenue:to.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+(o.totalHarga||0),0) });
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user, userData]);

  async function toggleStore() { if(!store)return; const n=!store.isOpen; await updateDoc(doc(db,"toko",store.id),{isOpen:n}); setStore(p=>({...p,isOpen:n})); }
  async function updateStatus(id, s) { await updateDoc(doc(db,"pesanan",id),{status:s}); setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o)); }

  const pending = orders.filter(o=>o.status==="pending");
  const active = orders.filter(o=>["confirmed","cooking","delivering"].includes(o.status));
  const ns = {confirmed:"cooking",cooking:"delivering",delivering:"done"};
  const nl = {confirmed:"Mulai Masak 🍳",cooking:"Kirim 🛵",delivering:"Selesai ✅"};

  if (al||loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5"}}><div style={{textAlign:"center"}}><div style={{fontSize:"48px",marginBottom:"8px"}}>🏪</div><p style={{color:"#9ca3af"}}>Memuat...</p></div></div>;

  if (chatOrder) return <ChatRoom pesananId={chatOrder.id} tokoId={chatOrder.tokoId} tokoNama={chatOrder.tokoNama||store?.nama} pembeliNama={chatOrder.pembeliNama} onClose={()=>setChatOrder(null)} />;

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>

      {/* ===== HEADER ===== */}
      <div style={{
        background:"linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
        padding:"20px 20px 28px", borderRadius:"0 0 24px 24px",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.7)" }}>🏪 Toko Anda</p>
            <h1 style={{ fontSize:"22px", fontWeight:900, color:"white", marginTop:"2px" }}>{store?.nama}</h1>
          </div>
          <button onClick={toggleStore} style={{
            display:"flex", alignItems:"center", gap:"8px",
            padding:"8px 16px", borderRadius:"50px",
            background: store?.isOpen ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            border:"none", cursor:"pointer",
          }}>
            <div style={{
              width:"10px", height:"10px", borderRadius:"50%",
              background: store?.isOpen ? "#4ade80" : "#f87171",
              boxShadow: store?.isOpen ? "0 0 8px #4ade80" : "0 0 8px #f87171",
            }}></div>
            <span style={{ fontSize:"13px", fontWeight:600, color:"white" }}>
              {store?.isOpen ? "Buka" : "Tutup"}
            </span>
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
          <div style={{ flex:1, background:"rgba(255,255,255,0.15)", borderRadius:"14px", padding:"14px", backdropFilter:"blur(4px)" }}>
            <div style={{ fontSize:"24px", fontWeight:900, color:"white" }}>{stats.today}</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.7)", marginTop:"2px" }}>📦 Pesanan Hari Ini</div>
          </div>
          <div style={{ flex:1, background:"rgba(255,255,255,0.15)", borderRadius:"14px", padding:"14px", backdropFilter:"blur(4px)" }}>
            <div style={{ fontSize:"20px", fontWeight:900, color:"white" }}>Rp {stats.revenue>=1000?Math.round(stats.revenue/1000)+"K":stats.revenue}</div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.7)", marginTop:"2px" }}>💰 Pendapatan</div>
          </div>
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div style={{ padding:"16px 20px 0", display:"flex", gap:"10px" }}>
        <button onClick={()=>router.push("/seller/produk")} style={{
          flex:1, padding:"14px", borderRadius:"14px", background:"white",
          border:"none", cursor:"pointer", textAlign:"center",
          boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize:"24px", marginBottom:"4px" }}>📦</div>
          <div style={{ fontSize:"12px", fontWeight:600, color:"#374151" }}>Kelola Produk</div>
        </button>
        <button onClick={()=>router.push("/seller/pesanan")} style={{
          flex:1, padding:"14px", borderRadius:"14px", background:"white",
          border:"none", cursor:"pointer", textAlign:"center",
          boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize:"24px", marginBottom:"4px" }}>📋</div>
          <div style={{ fontSize:"12px", fontWeight:600, color:"#374151" }}>Semua Pesanan</div>
        </button>
        <button onClick={()=>router.push("/seller/profil")} style={{
          flex:1, padding:"14px", borderRadius:"14px", background:"white",
          border:"none", cursor:"pointer", textAlign:"center",
          boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize:"24px", marginBottom:"4px" }}>⚙️</div>
          <div style={{ fontSize:"12px", fontWeight:600, color:"#374151" }}>Pengaturan</div>
        </button>
      </div>

      {/* ===== PENDING ORDERS ===== */}
      {pending.length > 0 && (
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <h3 style={{ fontSize:"16px", fontWeight:800, color:"#1f2937" }}>🔔 Pesanan Masuk</h3>
            <span style={{ padding:"4px 12px", borderRadius:"20px", background:"#fef2f2", color:"#ef4444", fontSize:"12px", fontWeight:700 }}>{pending.length} baru</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {pending.map(o => (
              <div key={o.id} style={{
                background:"white", borderRadius:"16px", padding:"16px",
                boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                borderLeft:"4px solid #f59e0b",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>👤</div>
                    <div>
                      <h4 style={{ fontSize:"14px", fontWeight:700, color:"#1f2937" }}>{o.pembeliNama}</h4>
                      <p style={{ fontSize:"11px", color:"#9ca3af" }}>{o.pembeliAlamat || "Alamat belum diisi"}</p>
                    </div>
                  </div>
                  <span style={{ fontSize:"11px", color:"#9ca3af" }}>{new Date(o.createdAt).toLocaleTimeString("id",{hour:"2-digit",minute:"2-digit"})}</span>
                </div>

                <div style={{ background:"#f9fafb", borderRadius:"10px", padding:"10px 12px", marginBottom:"10px" }}>
                  {o.items?.map((item,idx) => (
                    <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:"#374151", padding:"3px 0" }}>
                      <span>{item.nama} x{item.qty}</span>
                      <span style={{ color:"#6b7280" }}>Rp {(item.harga*item.qty).toLocaleString("id")}</span>
                    </div>
                  ))}
                </div>

                {o.catatan && <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"10px", padding:"8px 10px", background:"#fffbeb", borderRadius:"8px" }}>📝 {o.catatan}</p>}

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <span style={{ fontSize:"18px", fontWeight:800, color:"#f59e0b" }}>Rp {(o.totalHarga||0).toLocaleString("id")}</span>
                  <span style={{ fontSize:"12px", color:"#6b7280" }}>💵 COD</span>
                </div>

                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={()=>updateStatus(o.id,"cancelled")} style={{
                    flex:1, padding:"12px", borderRadius:"12px", background:"#f3f4f6",
                    color:"#6b7280", border:"none", fontWeight:600, fontSize:"14px", cursor:"pointer",
                  }}>✗ Tolak</button>
                  <button onClick={()=>updateStatus(o.id,"confirmed")} style={{
                    flex:2, padding:"12px", borderRadius:"12px",
                    background:"linear-gradient(135deg, #10b981, #059669)",
                    color:"white", border:"none", fontWeight:700, fontSize:"14px", cursor:"pointer",
                    boxShadow:"0 4px 12px rgba(16,185,129,0.3)",
                  }}>✓ Terima Pesanan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ACTIVE ORDERS ===== */}
      {active.length > 0 && (
        <div style={{ padding:"20px 20px 0" }}>
          <h3 style={{ fontSize:"16px", fontWeight:800, color:"#1f2937", marginBottom:"12px" }}>🍳 Pesanan Aktif</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {active.map(o => (
              <div key={o.id} style={{
                background:"white", borderRadius:"16px", padding:"14px",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>👤</div>
                    <span style={{ fontSize:"14px", fontWeight:600, color:"#1f2937" }}>{o.pembeliNama}</span>
                  </div>
                  <span style={{
                    fontSize:"11px", padding:"4px 10px", borderRadius:"20px", fontWeight:600,
                    background: o.status==="confirmed"?"#dbeafe":o.status==="cooking"?"#fef3c7":"#e0e7ff",
                    color: o.status==="confirmed"?"#2563eb":o.status==="cooking"?"#d97706":"#7c3aed",
                  }}>{o.status==="confirmed"?"✅ Diterima":o.status==="cooking"?"🍳 Dimasak":"🛵 Diantar"}</span>
                </div>
                <p style={{ fontSize:"13px", color:"#6b7280", marginBottom:"10px" }}>{o.items?.map(i=>i.nama+" x"+i.qty).join(", ")}</p>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={()=>setChatOrder(o)} style={{
                    padding:"10px 16px", borderRadius:"12px", background:"white",
                    border:"2px solid #e5e7eb", color:"#374151", fontWeight:600,
                    fontSize:"13px", cursor:"pointer",
                  }}>💬</button>
                  {ns[o.status] && <button onClick={()=>updateStatus(o.id,ns[o.status])} style={{
                    flex:1, padding:"10px", borderRadius:"12px",
                    background:"linear-gradient(135deg, #f59e0b, #ea580c)",
                    color:"white", border:"none", fontWeight:700, fontSize:"13px", cursor:"pointer",
                  }}>{nl[o.status]}</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!pending.length && !active.length && (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:"56px", marginBottom:"12px" }}>📭</div>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"#374151" }}>Belum Ada Pesanan</h3>
          <p style={{ fontSize:"13px", color:"#9ca3af", marginTop:"4px" }}>Pesanan dari pembeli akan muncul di sini</p>
        </div>
      )}

      <BottomNav role="seller" active="home" />
    </div>
  );
}
`);

// =============================================
// 2. SELLER PRODUK — Full Redesign Mobile
// =============================================
writeFile("app/seller/produk/page.js", `
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
`);

// =============================================
// 3. SELLER PESANAN — Redesign Mobile
// =============================================
writeFile("app/seller/pesanan/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";

const sb = {
  pending:{l:"⏳ Menunggu",bg:"#f3f4f6",c:"#4b5563"},
  confirmed:{l:"✅ Diterima",bg:"#dbeafe",c:"#2563eb"},
  cooking:{l:"🍳 Dimasak",bg:"#fef3c7",c:"#d97706"},
  delivering:{l:"🛵 Diantar",bg:"#e0e7ff",c:"#7c3aed"},
  done:{l:"✅ Selesai",bg:"#d1fae5",c:"#059669"},
  cancelled:{l:"❌ Batal",bg:"#fee2e2",c:"#dc2626"},
};

export default function SellerPesanan() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { if(!al&&!user) router.push("/login"); }, [user,al,router]);
  useEffect(() => {
    async function f() {
      if(!user) return;
      try {
        const sq = await getDocs(query(collection(db,"toko"),where("pemilikId","==",user.uid)));
        if(!sq.empty) { const os = await getDocs(query(collection(db,"pesanan"),where("tokoId","==",sq.docs[0].id)));
          setOrders(os.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); }
      } catch(e){console.error(e);}
      setLoading(false);
    } f();
  }, [user]);

  const fil = filter==="all" ? orders : orders.filter(o=>o.status===filter);

  const filters = [
    {id:"all",l:"Semua",count:orders.length},
    {id:"pending",l:"Baru",count:orders.filter(o=>o.status==="pending").length},
    {id:"confirmed",l:"Diterima",count:orders.filter(o=>o.status==="confirmed").length},
    {id:"cooking",l:"Dimasak",count:orders.filter(o=>o.status==="cooking").length},
    {id:"done",l:"Selesai",count:orders.filter(o=>o.status==="done").length},
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", paddingBottom:"80px" }}>
      {/* Header */}
      <div style={{ background:"white", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:"12px" }}>
        <button onClick={()=>router.push("/seller")} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <h1 style={{ fontSize:"18px", fontWeight:900, color:"#1f2937" }}>Riwayat Pesanan</h1>
      </div>

      {/* Filter Tabs */}
      <div style={{ padding:"12px 20px", display:"flex", gap:"8px", overflowX:"auto", background:"white", borderBottom:"1px solid #f3f4f6" }} className="no-scrollbar">
        {filters.map(f => (
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{
            padding:"8px 16px", borderRadius:"20px", border:"none",
            fontSize:"13px", fontWeight:600, cursor:"pointer",
            whiteSpace:"nowrap", flexShrink:0, transition:"all 0.2s",
            background: filter===f.id ? "linear-gradient(135deg, #f59e0b, #ea580c)" : "#f3f4f6",
            color: filter===f.id ? "white" : "#6b7280",
          }}>
            {f.l} {f.count > 0 && <span style={{
              marginLeft:"4px", padding:"1px 6px", borderRadius:"10px",
              background: filter===f.id ? "rgba(255,255,255,0.3)" : "#e5e7eb",
              fontSize:"11px",
            }}>{f.count}</span>}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div style={{ padding:"12px 20px", display:"flex", flexDirection:"column", gap:"10px" }}>
        {loading ? [1,2,3].map(i => <div key={i} style={{ background:"white", borderRadius:"14px", padding:"16px" }}><div className="skeleton" style={{ height:"60px" }}></div></div>)
        : fil.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:"56px", marginBottom:"12px" }}>📭</div>
            <p style={{ color:"#9ca3af", fontSize:"14px" }}>Tidak ada pesanan</p>
          </div>
        ) : fil.map(o => {
          const s = sb[o.status] || sb.pending;
          return (
            <div key={o.id} style={{
              background:"white", borderRadius:"16px", padding:"14px",
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                <div>
                  <p style={{ fontSize:"11px", color:"#9ca3af", fontFamily:"monospace" }}>#{o.id.slice(-8).toUpperCase()}</p>
                  <h4 style={{ fontSize:"15px", fontWeight:700, color:"#1f2937", marginTop:"2px" }}>👤 {o.pembeliNama}</h4>
                </div>
                <span style={{ padding:"4px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:600, background:s.bg, color:s.c }}>{s.l}</span>
              </div>
              <div style={{ background:"#f9fafb", borderRadius:"10px", padding:"8px 12px", marginBottom:"8px" }}>
                {o.items?.map((item,idx) => (
                  <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:"#374151", padding:"2px 0" }}>
                    <span>{item.nama} x{item.qty}</span>
                    <span style={{color:"#6b7280"}}>Rp {(item.harga*item.qty).toLocaleString("id")}</span>
                  </div>
                ))}
              </div>
              {o.catatan && <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"6px" }}>📝 {o.catatan}</p>}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px", borderTop:"1px solid #f3f4f6" }}>
                <span style={{ fontWeight:800, color:"#f59e0b", fontSize:"15px" }}>Rp {(o.totalHarga||0).toLocaleString("id")}</span>
                <span style={{ fontSize:"11px", color:"#9ca3af" }}>{new Date(o.createdAt).toLocaleDateString("id",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav role="seller" active="orders" />
    </div>
  );
}
`);

// =============================================
// 4. PROFIL — Upgrade untuk kedua role
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
`);

writeFile("app/seller/profil/page.js", `
export { default } from "@/app/buyer/profil/page";
`);

console.log("");
console.log("🎉 ========================================");
console.log("   SELLER PAGES UPGRADED!");
console.log("========================================");
console.log("");
console.log("   ✅ Seller Dashboard — Header gradient + stats glass");
console.log("   ✅ Quick Actions (3 tombol shortcut)");
console.log("   ✅ Pesanan Masuk — Detail item + harga per baris");
console.log("   ✅ Kelola Produk — Form full-screen mobile friendly");
console.log("   ✅ Emoji picker grid 8 kolom (mudah di-tap)");
console.log("   ✅ Kategori picker visual (bukan dropdown)");
console.log("   ✅ Live preview produk saat mengisi form");
console.log("   ✅ Floating Add Button (FAB)");
console.log("   ✅ Toggle tersedia/habis dengan switch");
console.log("   ✅ Riwayat Pesanan — Filter tabs + detail items");
console.log("   ✅ Profil — Gradient header + avatar card");
console.log("");
console.log("   Jalankan:");
console.log("   npm run dev    (test lokal)");
console.log("");
console.log("   Deploy ke internet:");
console.log("   git add .");
console.log('   git commit -m "upgrade seller UI"');
console.log("   git push");
console.log("");
