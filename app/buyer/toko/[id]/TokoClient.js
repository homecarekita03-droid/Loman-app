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
          height:"200px",
          background: store.banner ? "url("+store.banner+") center/cover no-repeat" : "linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"80px",
        }}>{!store.banner && (store.emoji || "🏪")}
          {store.logo && <div style={{ position:"absolute", bottom:"-28px", left:"20px", width:"60px", height:"60px", borderRadius:"18px", border:"3px solid white", background:"url("+store.logo+") center/cover no-repeat", boxShadow:"0 4px 12px rgba(0,0,0,0.12)", zIndex:6 }}></div>}</div>
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
