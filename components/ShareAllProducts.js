"use client";

export default function ShareAllProducts({ products, tokoNama, tokoId, onClose }) {
  var baseUrl = typeof window !== "undefined" ? window.location.origin : "https://loman.store";
  var url = baseUrl + "/buyer/toko/" + (tokoId || "");
  var domain = typeof window !== "undefined" ? window.location.host : "loman.store";
  var toko = tokoNama || "Toko";

  function getWAKatalog() {
    var t = "\u{1F3EA} *" + toko + "*\n";
    t += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n";
    products.forEach(function(p, i) {
      t += (i + 1) + ". *" + p.nama + "*  \u2014  Rp " + (p.harga || 0).toLocaleString("id") + "\n";
    });
    t += "\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
    t += "\n\u2705 Pesan langsung, antar ke rumah\n";
    t += "\u2705 Bayar di tempat (COD)\n";
    t += "\n\u{1F6D2} *PESAN SEKARANG* \u{1F447}\n";
    t += domain + "\n";
    t += "\n_Loman \u2014 Belanja Setetangga \u{1F3D8}\u{FE0F}_";
    return t;
  }

  function getPlainText() {
    var t = "\u{1F3EA} " + toko + "\n";
    t += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n";
    products.forEach(function(p, i) {
      t += (i + 1) + ". " + p.nama + " \u2014 Rp " + (p.harga || 0).toLocaleString("id") + "\n";
    });
    t += "\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
    t += "\n\u2705 Pesan langsung, antar ke rumah\n";
    t += "\u{1F449} PESAN: " + domain + "\n\n";
    t += "Loman \u2014 Belanja Setetangga";
    return t;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text); }
    else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
  }

  function shareWA() { window.open("https://wa.me/?text=" + encodeURIComponent(getWAKatalog()), "_blank"); }
  function shareIG() { copyToClipboard(getPlainText()); alert("Caption IG di-copy! \u2705\n\nBuka Instagram \u2192 Paste caption."); }
  function shareFB() { window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank"); }
  function shareTG() { window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(getPlainText()), "_blank"); }
  function copyAll() { copyToClipboard(getPlainText()); alert("Katalog di-copy! \u2705"); }

  function nativeShare() {
    if (navigator.share) { navigator.share({ title: toko + " \u2014 Menu", text: getPlainText(), url: url }); }
  }

  var shares = [
    { name: "WhatsApp", icon: "\u{1F4AC}", fn: shareWA },
    { name: "Instagram", icon: "\u{1F4F7}", fn: shareIG },
    { name: "Facebook", icon: "\u{1F4D8}", fn: shareFB },
    { name: "Telegram", icon: "\u2708\uFE0F", fn: shareTG },
    { name: "Copy", icon: "\u{1F517}", fn: copyAll },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", width: "100%", maxWidth: "480px", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Share Semua Produk</h3>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>\u2715</button>
        </div>

        <div style={{ background: "#1f2937", borderRadius: "14px", padding: "16px", marginBottom: "16px", maxHeight: "220px", overflowY: "auto" }}>
          <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>Preview:</p>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#fbbf24", marginBottom: "6px" }}>\u{1F3EA} {toko}</p>
          <div style={{ borderTop: "1px solid #374151", paddingTop: "8px" }}>
            {products.map(function(p, i) {
              return <p key={p.id || i} style={{ fontSize: "13px", color: "#e2e8f0", marginBottom: "3px" }}>{(i + 1) + ". " + p.nama + "  \u2014  "}<span style={{ color: "#fbbf24" }}>{"Rp " + (p.harga || 0).toLocaleString("id")}</span></p>;
            })}
          </div>
          <div style={{ borderTop: "1px solid #374151", marginTop: "8px", paddingTop: "8px" }}>
            <p style={{ fontSize: "12px", color: "#34d399" }}>\u2705 Pesan langsung, antar ke rumah</p>
            <p style={{ fontSize: "13px", color: "#fbbf24", fontWeight: 700, marginTop: "4px" }}>\u{1F6D2} PESAN: {domain}</p>
          </div>
        </div>

        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "14px", textAlign: "center" }}>{products.length} produk</p>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{ width: "100%", padding: "14px", borderRadius: "14px", marginBottom: "12px", background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}>\u{1F4E4} Bagikan Sekarang</button>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
          {shares.map(function(s) {
            return (
              <button key={s.name} onClick={s.fn} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 4px", borderRadius: "14px", border: "none", background: "#f9fafb", cursor: "pointer" }}>
                <span style={{ fontSize: "24px" }}>{s.icon}</span>
                <span style={{ fontSize: "9px", color: "#6b7280" }}>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
