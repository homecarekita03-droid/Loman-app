"use client";

export default function ShareProduct({ product, tokoNama, onClose }) {
  const url = typeof window !== "undefined" ? window.location.origin + "/buyer/toko/" + product.tokoId : "loman.store";
  const domain = typeof window !== "undefined" ? window.location.host : "loman.store";

  // Format WA (dengan bold/italic markdown)
  const waText = "🔥 *" + product.nama + "* 🔥\n"
    + "━━━━━━━━━━━━━━━\n"
    + "💰 *Rp " + (product.harga||0).toLocaleString("id") + "*\n"
    + (product.deskripsi ? "\n📝 " + product.deskripsi + "\n" : "")
    + "\n🏪 _" + (tokoNama||"Toko di Loman") + "_\n"
    + "\n✅ Pesan langsung, antar ke rumah!\n"
    + "✅ Bayar di tempat (COD)\n"
    + "\n👉 *PESAN SEKARANG:*\n"
    + domain + "\n"
    + "\n_Loman — Belanja Setetangga 🏘️_";

  // Format biasa (untuk copy/FB/Twitter)
  const plainText = "🔥 " + product.nama + " 🔥\n"
    + "━━━━━━━━━━━━━━━\n"
    + "💰 Rp " + (product.harga||0).toLocaleString("id") + "\n"
    + (product.deskripsi ? "📝 " + product.deskripsi + "\n" : "")
    + "🏪 " + (tokoNama||"") + "\n"
    + "\n✅ Pesan langsung, antar ke rumah!\n"
    + "👉 PESAN: " + domain + "\n"
    + "\nLoman — Belanja Setetangga 🏘️";

  const shares = [
    { name: "WhatsApp", icon: "💬", color: "#25D366",
      action: () => window.open("https://wa.me/?text=" + encodeURIComponent(waText), "_blank") },
    { name: "WA Story", icon: "📸", color: "#25D366",
      action: () => {
        // Copy ke clipboard lalu instruksi user
        navigator.clipboard?.writeText(waText.replace(/\\n/g,"\n").replace(/[*_]/g,""));
        alert("Teks sudah di-copy! ✅\n\nSekarang buka WhatsApp → Status → Paste teks ini sebagai caption foto produk Anda.");
      }},
    { name: "Instagram", icon: "📷", color: "#E1306C",
      action: () => {
        navigator.clipboard?.writeText(
          product.nama + " 🔥\n"
          + "💰 Rp " + (product.harga||0).toLocaleString("id") + "\n"
          + "\n" + (product.deskripsi||"") + "\n"
          + "\n🛒 Pesan di loman.store\n"
          + "🏪 " + (tokoNama||"") + "\n"
          + "\n#JualanOnline #UMKM #Loman #BelanjaSetetangga #" + (product.nama||"").replace(/\s/g,"")
        );
        alert("Caption sudah di-copy! ✅\n\nSekarang buka Instagram → Buat Post/Story → Paste sebagai caption.");
      }},
    { name: "Facebook", icon: "📘", color: "#1877F2",
      action: () => window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) + "&quote=" + encodeURIComponent(plainText), "_blank") },
    { name: "Telegram", icon: "✈️", color: "#0088cc",
      action: () => window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(plainText), "_blank") },
    { name: "Twitter", icon: "🐦", color: "#1DA1F2",
      action: () => window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(
        "🔥 " + product.nama + "\n💰 Rp " + (product.harga||0).toLocaleString("id")
        + "\n\n🛒 Pesan di " + domain
        + "\n\n#UMKM #Loman #BelanjaSetetangga"
      ), "_blank") },
    { name: "Copy", icon: "🔗", color: "#6b7280",
      action: () => {
        navigator.clipboard?.writeText(waText.replace(/\\n/g,"\n").replace(/[*_]/g,"")).then(()=>{
          alert("Teks berhasil di-copy! ✅\nPaste di mana saja.");
        }).catch(()=>{ prompt("Copy teks ini:", plainText); });
      }},
  ];

  function nativeShare() {
    if (navigator.share) {
      navigator.share({
        title: product.nama + " — " + (tokoNama||"Loman"),
        text: plainText.replace(/\\n/g,"\n"),
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
        maxHeight:"90vh", overflowY:"auto",
        animation:"slideUp 0.3s ease",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:800 }}>📤 Bagikan Produk</h3>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"16px" }}>✕</button>
        </div>

        {/* Product preview */}
        <div style={{ background:"#f9fafb", borderRadius:"14px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
            {product.foto ? (
              <img src={product.foto} alt="" style={{ width:"56px", height:"56px", borderRadius:"12px", objectFit:"cover" }} />
            ) : (
              <div style={{ width:"56px", height:"56px", borderRadius:"12px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>{product.emoji||"📦"}</div>
            )}
            <div>
              <h4 style={{ fontSize:"15px", fontWeight:700 }}>{product.nama}</h4>
              <p style={{ fontSize:"16px", fontWeight:800, color:"#f59e0b" }}>Rp {(product.harga||0).toLocaleString("id")}</p>
            </div>
          </div>
          {/* Preview pesan */}
          <div style={{ marginTop:"12px", padding:"10px 12px", background:"white", borderRadius:"10px", border:"1px solid #e5e7eb" }}>
            <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"4px" }}>Preview pesan:</p>
            <p style={{ fontSize:"12px", color:"#374151", lineHeight:1.6, whiteSpace:"pre-line" }}>
              {"🔥 " + product.nama + " 🔥\n💰 Rp " + (product.harga||0).toLocaleString("id") + "\n🏪 " + (tokoNama||"") + "\n\n✅ Pesan langsung, antar ke rumah!\n👉 PESAN: " + domain}
            </p>
          </div>
        </div>

        {/* Native share (mobile) */}
        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{
            width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px",
            background:"linear-gradient(135deg, #f59e0b, #ea580c)",
            color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer",
            boxShadow:"0 4px 12px rgba(245,158,11,0.3)",
          }}>📤 Bagikan Sekarang</button>
        )}

        {/* Share options */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"8px" }}>
          {shares.map(s => (
            <button key={s.name} onClick={s.action} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
              padding:"14px 4px", borderRadius:"14px", border:"none",
              background:"#f9fafb", cursor:"pointer", transition:"background 0.15s",
            }}
            onMouseOver={e=>e.currentTarget.style.background="#f3f4f6"}
            onMouseOut={e=>e.currentTarget.style.background="#f9fafb"}>
              <span style={{ fontSize:"26px" }}>{s.icon}</span>
              <span style={{ fontSize:"10px", color:"#6b7280", fontWeight:500 }}>{s.name}</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign:"center", fontSize:"11px", color:"#d1d5db", marginTop:"16px" }}>
          💡 Tip: Share dengan foto produk untuk hasil lebih menarik!
        </p>
      </div>
    </div>
  );
}
