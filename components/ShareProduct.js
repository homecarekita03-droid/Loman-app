"use client";

export default function ShareProduct({ product, tokoNama, onClose }) {
  const url = typeof window !== "undefined" ? window.location.origin + "/buyer/toko/" + product.tokoId : "";

  const text = "🛒 *" + product.nama + "*\n"
    + "💰 Rp " + (product.harga || 0).toLocaleString("id") + "\n"
    + (product.deskripsi ? "📝 " + product.deskripsi + "\n" : "")
    + "🏪 " + (tokoNama || "Toko di Loman") + "\n\n"
    + "Pesan sekarang di 👉 " + url + "\n"
    + "_Loman — Belanja Setetangga 🏘️_";

  const encodedText = encodeURIComponent(text);

  const shares = [
    { name: "WhatsApp", icon: "💬", color: "#25D366", url: "https://wa.me/?text=" + encodedText },
    { name: "Telegram", icon: "✈️", color: "#0088cc", url: "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodedText },
    { name: "Facebook", icon: "📘", color: "#1877F2", url: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) + "&quote=" + encodedText },
    { name: "Twitter/X", icon: "🐦", color: "#1DA1F2", url: "https://twitter.com/intent/tweet?text=" + encodedText },
    { name: "Copy Link", icon: "🔗", color: "#6b7280", url: null },
  ];

  function handleShare(s) {
    if (s.url) {
      window.open(s.url, "_blank");
    } else {
      navigator.clipboard?.writeText(url + "\n\n" + text.replace(/\\n/g, "\n")).then(() => {
        alert("Link berhasil dicopy! Paste di mana saja.");
      }).catch(() => {
        prompt("Copy link ini:", url);
      });
    }
  }

  // Native share (mobile)
  function nativeShare() {
    if (navigator.share) {
      navigator.share({ title: product.nama, text: text.replace(/\\n/g, "\n").replace(/[*_]/g, ""), url });
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "white", width: "100%", maxWidth: "480px",
        borderRadius: "24px 24px 0 0", padding: "24px 20px 32px",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>📤 Bagikan Produk</h3>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>

        {/* Product preview */}
        <div style={{ display: "flex", gap: "12px", padding: "12px", background: "#f9fafb", borderRadius: "14px", marginBottom: "20px", alignItems: "center" }}>
          {product.foto ? (
            <img src={product.foto} alt="" style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>{product.emoji || "📦"}</div>
          )}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700 }}>{product.nama}</h4>
            <p style={{ fontSize: "14px", fontWeight: 800, color: "#f59e0b" }}>Rp {(product.harga || 0).toLocaleString("id")}</p>
          </div>
        </div>

        {/* Native share button (mobile) */}
        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{
            width: "100%", padding: "14px", borderRadius: "14px", marginBottom: "12px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer",
          }}>📤 Bagikan...</button>
        )}

        {/* Share options */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
          {shares.map(s => (
            <button key={s.name} onClick={() => handleShare(s)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              padding: "12px 4px", borderRadius: "14px", border: "none",
              background: "#f9fafb", cursor: "pointer",
            }}>
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
              <span style={{ fontSize: "10px", color: "#6b7280", fontWeight: 500 }}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
