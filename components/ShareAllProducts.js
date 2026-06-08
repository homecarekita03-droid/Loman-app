"use client";

export default function ShareAllProducts({ products, tokoNama, tokoId, onClose }) {
  const url = typeof window !== "undefined" ? window.location.origin + "/buyer/toko/" + tokoId : "loman.store";
  const domain = typeof window !== "undefined" ? window.location.host : "loman.store";

  // WA format (bold/italic)
  let waKatalog = "🏪 *" + tokoNama + "*\n";
  waKatalog += "━━━━━━━━━━━━━━━━━\n\n";
  
  products.forEach((p, i) => {
    waKatalog += (i+1) + ". *" + p.nama + "*  —  Rp " + (p.harga||0).toLocaleString("id") + "\n";
  });

  waKatalog += "\n━━━━━━━━━━━━━━━━━\n";
  waKatalog += "\n✅ Pesan langsung, antar ke rumah\n";
  waKatalog += "✅ Bayar di tempat (COD)\n";
  waKatalog += "\n🛒 *PESAN SEKARANG* 👇\n";
  waKatalog += domain + "\n";
  waKatalog += "\n_Loman — Belanja Setetangga 🏘️_";

  // IG format
  const igCaption = "🏪 " + tokoNama + "\n\n"
    + "📋 Menu/Produk Kami:\n"
    + products.map((p,i) => (i+1) + ". " + p.nama + " — Rp " + (p.harga||0).toLocaleString("id")).join("\n")
    + "\n\n🛒 Pesan di loman.store\n"
    + "✅ Antar ke rumah • Bayar COD\n"
    + "\n#JualanOnline #UMKM #Loman #BelanjaSetetangga #" + (tokoNama||"").replace(/\s/g,"");

  const shares = [
    { name: "WhatsApp", icon: "💬",
      action: () => window.open("https://wa.me/?text=" + encodeURIComponent(waKatalog), "_blank") },
    { name: "Instagram", icon: "📷",
      action: () => {
        navigator.clipboard?.writeText(igCaption.replace(/\\n/g,"\n"));
        alert("Caption IG sudah di-copy! ✅\n\nBuka Instagram → Buat Post → Paste caption.");
      }},
    { name: "Facebook", icon: "📘",
      action: () => window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank") },
    { name: "Telegram", icon: "✈️",
      action: () => window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(waKatalog), "_blank") },
    { name: "Copy", icon: "🔗",
      action: () => {
        navigator.clipboard?.writeText(waKatalog.replace(/\\n/g,"\n").replace(/[*_]/g,"")).then(()=>{
          alert("Katalog di-copy! ✅");
        });
      }},
  ];

  function nativeShare() {
    if (navigator.share) {
      navigator.share({
        title: tokoNama + " — Menu Lengkap",
        text: waKatalog.replace(/\\n/g,"\n").replace(/[*_]/g,""),
        url,
      });
    }
  }

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.5)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
    }} onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{
        background:"white", width:"100%", maxWidth:"480px",
        borderRadius:"24px 24px 0 0", padding:"24px 20px 32px",
        maxHeight:"85vh", overflowY:"auto",
        animation:"slideUp 0.3s ease",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:800 }}>📤 Bagikan Semua Produk</h3>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"16px" }}>✕</button>
        </div>

        {/* Preview */}
        <div style={{ background:"#1f2937", borderRadius:"14px", padding:"16px", marginBottom:"16px", maxHeight:"240px", overflowY:"auto" }}>
          <p style={{ fontSize:"11px", color:"#64748b", marginBottom:"8px" }}>Preview pesan:</p>
          <div style={{ fontSize:"13px", color:"#e2e8f0", lineHeight:1.8, fontFamily:"monospace" }}>
            <p style={{ fontWeight:700, color:"#fbbf24", marginBottom:"4px" }}>🏪 {tokoNama}</p>
            <p style={{ color:"#475569", marginBottom:"8px" }}>━━━━━━━━━━━━━━</p>
            {products.map((p, i) => (
              <p key={p.id} style={{ marginBottom:"2px" }}>
                <span style={{ color:"#9ca3af" }}>{i+1}.</span> <span style={{ color:"#f1f5f9" }}>{p.nama}</span> <span style={{ color:"#fbbf24" }}>Rp {(p.harga||0).toLocaleString("id")}</span>
              </p>
            ))}
            <p style={{ color:"#475569", marginTop:"8px", marginBottom:"8px" }}>━━━━━━━━━━━━━━</p>
            <p style={{ color:"#34d399" }}>✅ Pesan langsung, antar ke rumah</p>
            <p style={{ color:"#fbbf24", fontWeight:700, marginTop:"4px" }}>🛒 PESAN: {domain}</p>
          </div>
        </div>

        <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"14px", textAlign:"center" }}>
          📋 {products.length} produk akan dibagikan
        </p>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{
            width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px",
            background:"linear-gradient(135deg, #f59e0b, #ea580c)",
            color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer",
          }}>📤 Bagikan Sekarang</button>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"6px" }}>
          {shares.map(s => (
            <button key={s.name} onClick={s.action} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
              padding:"12px 4px", borderRadius:"14px", border:"none",
              background:"#f9fafb", cursor:"pointer",
            }}>
              <span style={{ fontSize:"24px" }}>{s.icon}</span>
              <span style={{ fontSize:"9px", color:"#6b7280" }}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
