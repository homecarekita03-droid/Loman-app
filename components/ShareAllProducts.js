"use client";

export default function ShareAllProducts({ products, tokoNama, tokoId, onClose }) {
  const url = typeof window !== "undefined" ? window.location.origin + "/buyer/toko/" + tokoId : "";

  // Generate katalog text
  let katalog = "🏪 *" + tokoNama + "*\n";
  katalog += "━━━━━━━━━━━━━━━━━\n\n";
  katalog += "📋 *DAFTAR MENU/PRODUK:*\n\n";

  products.forEach((p, i) => {
    katalog += (i+1) + ". *" + p.nama + "*\n";
    katalog += "   💰 Rp " + (p.harga||0).toLocaleString("id") + "\n";
    if (p.deskripsi) katalog += "   📝 " + p.deskripsi + "\n";
    katalog += "\n";
  });

  katalog += "━━━━━━━━━━━━━━━━━\n";
  katalog += "🛒 Pesan sekarang di:\n";
  katalog += "👉 " + url + "\n\n";
  katalog += "_Loman — Belanja Setetangga 🏘️_";

  const encodedText = encodeURIComponent(katalog);

  const shares = [
    { name: "WhatsApp", icon: "💬", url: "https://wa.me/?text=" + encodedText },
    { name: "Telegram", icon: "✈️", url: "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodedText },
    { name: "Facebook", icon: "📘", url: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) },
    { name: "Twitter/X", icon: "🐦", url: "https://twitter.com/intent/tweet?text=" + encodedText },
    { name: "Copy", icon: "🔗", url: null },
  ];

  function handleShare(s) {
    if (s.url) {
      window.open(s.url, "_blank");
    } else {
      const plainText = katalog.replace(/\\n/g, "\n").replace(/[*_]/g, "");
      navigator.clipboard?.writeText(plainText).then(() => {
        alert("Katalog berhasil dicopy!");
      }).catch(() => {
        prompt("Copy text ini:", plainText);
      });
    }
  }

  function nativeShare() {
    if (navigator.share) {
      navigator.share({
        title: tokoNama + " — Menu Lengkap",
        text: katalog.replace(/\\n/g, "\n").replace(/[*_]/g, ""),
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

        {/* Preview katalog */}
        <div style={{ background:"#f9fafb", borderRadius:"14px", padding:"14px", marginBottom:"16px", maxHeight:"200px", overflowY:"auto" }}>
          <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"8px" }}>Preview yang akan dikirim:</p>
          <div style={{ fontSize:"13px", color:"#374151", lineHeight:1.6 }}>
            <p style={{ fontWeight:700, marginBottom:"4px" }}>🏪 {tokoNama}</p>
            <p style={{ color:"#9ca3af", marginBottom:"8px" }}>━━━━━━━━━━━━━</p>
            {products.map((p, i) => (
              <div key={p.id} style={{ marginBottom:"8px" }}>
                <p style={{ fontWeight:600 }}>{i+1}. {p.nama}</p>
                <p style={{ color:"#f59e0b", fontWeight:700 }}>   💰 Rp {(p.harga||0).toLocaleString("id")}</p>
              </div>
            ))}
            <p style={{ color:"#9ca3af" }}>━━━━━━━━━━━━━</p>
            <p>🛒 Pesan di: {url}</p>
          </div>
        </div>

        <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"16px", textAlign:"center" }}>
          {products.length} produk akan dibagikan
        </p>

        {/* Native share */}
        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{
            width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px",
            background:"linear-gradient(135deg, #f59e0b, #ea580c)",
            color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer",
          }}>📤 Bagikan...</button>
        )}

        {/* Share options */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"8px" }}>
          {shares.map(s => (
            <button key={s.name} onClick={()=>handleShare(s)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
              padding:"12px 4px", borderRadius:"14px", border:"none",
              background:"#f9fafb", cursor:"pointer",
            }}>
              <span style={{ fontSize:"24px" }}>{s.icon}</span>
              <span style={{ fontSize:"10px", color:"#6b7280" }}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
