"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import BottomNav from "@/components/BottomNav";
import { alertSuccess, alertError } from "@/components/SweetAlert";
import { notifPesananBaru } from "@/lib/waNotif";

export default function KeranjangPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [cart, setCart] = useState([]);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem("loman_cart")||"[]")); } catch(e){} }, []);
  useEffect(() => { localStorage.setItem("loman_cart", JSON.stringify(cart)); }, [cart]);

  function changeQty(id, d) { setCart(prev => prev.map(i => i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0)); }
  const total = cart.reduce((s,i) => s+i.harga*i.qty, 0);

  async function checkout() {
    if (!user || !cart.length) return;
    setLoading(true);
    try {
      const groups = {};
      cart.forEach(i => { if(!groups[i.tokoId]) groups[i.tokoId]={tokoId:i.tokoId,tokoNama:i.tokoNama,items:[]}; groups[i.tokoId].items.push(i); });
      for (const g of Object.values(groups)) {
        const sub = g.items.reduce((s,i)=>s+i.harga*i.qty,0);
        await addDoc(collection(db,"pesanan"),{
          pembeliId:user.uid, pembeliNama:userData?.nama||"User", pembeliAlamat:userData?.alamat||"", pembeliPhone:userData?.phone||"",
          tokoId:g.tokoId, tokoNama:g.tokoNama, items:g.items.map(i=>({produkId:i.id,nama:i.nama,harga:i.harga,qty:i.qty,subtotal:i.harga*i.qty})),
          totalHarga:sub, status:"pending", catatan, metodeBayar:"cash", createdAt:new Date().toISOString(),
        });
      }
      setCart([]); localStorage.removeItem("loman_cart"); setSuccess(true);
      // Smart WA: kirim pengingat singkat ke penjual
      try {
        for (var gKey of Object.keys(groups)) {
          var g = groups[gKey];
          var tokoDoc = await getDoc(doc(db, "toko", g.tokoId));
          if (tokoDoc.exists()) {
            var tokoData = tokoDoc.data();
            var sellerPhone = tokoData.whatsapp || "";
            if (sellerPhone) {
              var waUrl = notifPesananBaru(sellerPhone, userData?.nama || "Pembeli");
              if (waUrl) window.open(waUrl, "_blank");
            }
          }
        }
      } catch(we) { console.log("WA notif:", we); }
    } catch(e) { console.error(e); alertError("Gagal", "Tidak bisa membuat pesanan. Coba lagi."); }
    setLoading(false);
  }

  if (success) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", background:"white" }}>
      <div style={{ width:"100px", height:"100px", borderRadius:"50%", background:"linear-gradient(135deg,#d1fae5,#a7f3d0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"48px", marginBottom:"20px" }}>🎉</div>
      <h2 style={{ fontSize:"24px", fontWeight:900, color:"#1f2937", marginBottom:"8px" }}>Pesanan Berhasil!</h2>
      <p style={{ fontSize:"14px", color:"#6b7280", textAlign:"center", lineHeight:1.6, maxWidth:"280px" }}>Pesanan Anda sudah dikirim ke penjual. Tunggu konfirmasi ya!</p>
      <button onClick={()=>router.push("/buyer/pesanan")} style={{ marginTop:"24px", padding:"14px 32px", borderRadius:"14px", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer", boxShadow:"0 4px 16px rgba(245,158,11,0.3)" }}>Lihat Pesanan Saya</button>
      <button onClick={()=>router.push("/buyer")} style={{ marginTop:"12px", padding:"12px 32px", borderRadius:"14px", background:"none", border:"none", color:"#6b7280", fontWeight:600, fontSize:"14px", cursor:"pointer" }}>Kembali Belanja</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", paddingBottom: cart.length > 0 ? "180px" : "80px" }}>
      {/* Header */}
      <div style={{
        background: "white", padding: "16px 20px",
        display: "flex", alignItems: "center", gap: "12px",
        borderBottom: "1px solid #f3f4f6",
      }}>
        <button onClick={() => router.back()} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
        <h1 style={{ fontSize: "18px", fontWeight: 900, color: "#1f2937" }}>Keranjang <span style={{ color:"#9ca3af", fontWeight:400 }}>({cart.reduce((s,i)=>s+i.qty,0)})</span></h1>
      </div>

      {cart.length === 0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 24px" }}>
          <div style={{ fontSize:"64px", marginBottom:"16px" }}>🛒</div>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"#374151" }}>Keranjang Kosong</h3>
          <p style={{ fontSize:"14px", color:"#9ca3af", marginTop:"4px" }}>Yuk pesan dari tetangga!</p>
          <button onClick={()=>router.push("/buyer")} style={{ marginTop:"20px", padding:"12px 28px", borderRadius:"12px", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", border:"none", fontWeight:600, cursor:"pointer" }}>Mulai Belanja</button>
        </div>
      ) : (
        <>
          {/* Toko Name */}
          <div style={{ padding:"16px 20px 8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"14px", color:"#6b7280" }}>
              <span>🏪</span>
              <span style={{ fontWeight:600, color:"#1f2937" }}>{cart[0]?.tokoNama}</span>
            </div>
          </div>

          {/* Cart Items */}
          <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:"8px" }}>
            {cart.map(i => (
              <div key={i.id} style={{
                background: "white", borderRadius: "14px", padding: "14px",
                display: "flex", alignItems: "center", gap: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"12px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", flexShrink:0 }}>{i.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h4 style={{ fontSize:"14px", fontWeight:600, color:"#1f2937" }}>{i.nama}</h4>
                  <p style={{ fontSize:"14px", fontWeight:800, color:"#f59e0b", marginTop:"2px" }}>Rp {(i.harga*i.qty).toLocaleString("id")}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"4px", background:"#fff7ed", borderRadius:"10px", padding:"4px" }}>
                  <button onClick={()=>changeQty(i.id,-1)} style={{ width:"30px", height:"30px", borderRadius:"8px", border:"none", background:"white", fontSize:"15px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 2px rgba(0,0,0,0.06)" }}>−</button>
                  <span style={{ fontWeight:800, fontSize:"14px", minWidth:"20px", textAlign:"center", color:"#d97706" }}>{i.qty}</span>
                  <button onClick={()=>changeQty(i.id,1)} style={{ width:"30px", height:"30px", borderRadius:"8px", border:"none", background:"linear-gradient(135deg,#f59e0b,#ea580c)", color:"white", fontSize:"15px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Catatan */}
          <div style={{ padding:"12px 16px" }}>
            <div style={{ background:"white", borderRadius:"14px", padding:"14px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <label style={{ fontSize:"13px", fontWeight:600, color:"#374151", marginBottom:"8px", display:"block" }}>📝 Catatan untuk penjual</label>
              <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Contoh: Tidak pedas, extra sambal..." rows={2}
                style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"13px", resize:"none", outline:"none", background:"#f9fafb", transition:"border-color 0.2s" }}
                onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            position:"fixed", bottom:"64px", left:"50%", transform:"translateX(-50%)",
            width:"100%", maxWidth:"480px", background:"white",
            borderTop:"1px solid #f3f4f6", padding:"16px 20px",
            boxShadow:"0 -4px 16px rgba(0,0,0,0.06)", zIndex:40,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
              <div>
                <p style={{ fontSize:"12px", color:"#9ca3af" }}>Total Pembayaran</p>
                <p style={{ fontSize:"22px", fontWeight:900, color:"#1f2937" }}>Rp {total.toLocaleString("id")}</p>
              </div>
              <div style={{ fontSize:"12px", color:"#6b7280", textAlign:"right" }}>
                <p>💵 Bayar di tempat (COD)</p>
              </div>
            </div>
            <button onClick={checkout} disabled={loading} style={{
              width:"100%", padding:"15px", borderRadius:"14px", border:"none",
              background: loading ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
              color:"white", fontWeight:700, fontSize:"16px", cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : "0 4px 16px rgba(245,158,11,0.3)",
            }}>{loading ? "Memproses... ⏳" : "Pesan Sekarang 🛵"}</button>
          </div>
        </>
      )}
      <BottomNav role="buyer" active="cart" />
    </div>
  );
}
const pesan = notifTemplates.newOrder(toko.nama, daftarBarang, totalHarga, alamatUser);
sendWA(toko.waPenjual, pesan);