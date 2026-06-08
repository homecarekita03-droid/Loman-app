"use client";

export default function ShareProduct({ product, tokoNama, onClose }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://loman.store";
  const url = baseUrl + "/buyer/toko/" + (product.tokoId || "");
  const domain = typeof window !== "undefined" ? window.location.host : "loman.store";
  const nama = product.nama || "Produk";
  const harga = (product.harga || 0).toLocaleString("id");
  const desk = product.deskripsi || "";
  const toko = tokoNama || "Toko di Loman";

  function getWAText() {
    let t = "\u{1F525} *" + nama + "* \u{1F525}\n";
    t += "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n";
    t += "\u{1F4B0} *Rp " + harga + "*\n";
    if (desk) t += "\n\u{1F4DD} " + desk + "\n";
    t += "\n\u{1F3EA} _" + toko + "_\n";
    t += "\n\u2705 Pesan langsung, antar ke rumah!\n";
    t += "\u2705 Bayar di tempat (COD)\n";
    t += "\n\u{1F449} *PESAN SEKARANG:*\n";
    t += domain + "\n";
    t += "\n_Loman \u2014 Belanja Setetangga \u{1F3D8}\u{FE0F}_";
    return t;
  }

  function getPlainText() {
    let t = "\u{1F525} " + nama + " \u{1F525}\n";
    t += "\u{1F4B0} Rp " + harga + "\n";
    if (desk) t += "\u{1F4DD} " + desk + "\n";
    t += "\u{1F3EA} " + toko + "\n\n";
    t += "\u2705 Pesan langsung, antar ke rumah!\n";
    t += "\u{1F449} PESAN: " + domain + "\n\n";
    t += "Loman \u2014 Belanja Setetangga";
    return t;
  }

  function getIGCaption() {
    let t = nama + " \u{1F525}\n";
    t += "\u{1F4B0} Rp " + harga + "\n\n";
    if (desk) t += desk + "\n\n";
    t += "\u{1F6D2} Pesan di loman.store\n";
    t += "\u{1F3EA} " + toko + "\n\n";
    t += "#JualanOnline #UMKM #Loman #BelanjaSetetangga";
    return t;
  }

  function shareWA() {
    window.open("https://wa.me/?text=" + encodeURIComponent(getWAText()), "_blank");
  }

  function shareWAStory() {
    copyToClipboard(getPlainText());
    alert("Teks sudah di-copy! \u2705\n\nBuka WhatsApp \u2192 Status \u2192 Paste sebagai caption foto produk.");
  }

  function shareIG() {
    copyToClipboard(getIGCaption());
    alert("Caption IG sudah di-copy! \u2705\n\nBuka Instagram \u2192 Buat Post/Story \u2192 Paste caption.");
  }

  function shareFB() {
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank");
  }

  function shareTelegram() {
    window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(getPlainText()), "_blank");
  }

  function shareTwitter() {
    var tweet = "\u{1F525} " + nama + "\n\u{1F4B0} Rp " + harga + "\n\n\u{1F6D2} Pesan di " + domain + "\n\n#UMKM #Loman";
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweet), "_blank");
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  function copyLink() {
    copyToClipboard(getPlainText());
    alert("Teks berhasil di-copy! \u2705");
  }

  function nativeShare() {
    if (navigator.share) {
      navigator.share({ title: nama, text: getPlainText(), url: url });
    }
  }

  var shares = [
    { name: "WhatsApp", icon: "\u{1F4AC}", fn: shareWA },
    { name: "WA Story", icon: "\u{1F4F8}", fn: shareWAStory },
    { name: "Instagram", icon: "\u{1F4F7}", fn: shareIG },
    { name: "Facebook", icon: "\u{1F4D8}", fn: shareFB },
    { name: "Telegram", icon: "\u2708\uFE0F", fn: shareTelegram },
    { name: "Twitter", icon: "\u{1F426}", fn: shareTwitter },
    { name: "Copy", icon: "\u{1F517}", fn: copyLink },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "white", width: "100%", maxWidth: "480px",
        borderRadius: "24px 24px 0 0", padding: "24px 20px 32px",
        maxHeight: "90vh", overflowY: "auto",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Share Produk</h3>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>\u2715</button>
        </div>

        <div style={{ background: "#f9fafb", borderRadius: "14px", padding: "14px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {product.foto ? (
              <img src={product.foto} alt="" style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>{product.emoji || "\u{1F4E6}"}</div>
            )}
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{nama}</h4>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "#f59e0b" }}>Rp {harga}</p>
            </div>
          </div>
          <div style={{ marginTop: "12px", padding: "10px 12px", background: "white", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Preview pesan:</p>
            <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.6 }}>
              {"\u{1F525} " + nama + " \u{1F525}"}<br/>
              {"\u{1F4B0} Rp " + harga}<br/>
              {"\u{1F3EA} " + toko}<br/><br/>
              {"\u2705 Pesan langsung, antar ke rumah!"}<br/>
              {"\u{1F449} PESAN: " + domain}
            </p>
          </div>
        </div>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{
            width: "100%", padding: "14px", borderRadius: "14px", marginBottom: "12px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer",
          }}>\u{1F4E4} Bagikan Sekarang</button>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {shares.map(function(s) {
            return (
              <button key={s.name} onClick={s.fn} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                padding: "14px 4px", borderRadius: "14px", border: "none",
                background: "#f9fafb", cursor: "pointer",
              }}>
                <span style={{ fontSize: "24px" }}>{s.icon}</span>
                <span style={{ fontSize: "10px", color: "#6b7280" }}>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
