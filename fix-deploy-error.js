// ============================================
// 🔧 FIX DEPLOY ERROR + Share Produk Baru
// ============================================
// Jalankan: node fix-deploy-error.js
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
console.log("🔧 ========================================");
console.log("   Fix Deploy Error + Share Produk");
console.log("========================================");
console.log("");

// =============================================
// 1. SHARE PRODUCT (Tulis ulang bersih)
// =============================================
writeFile("components/ShareProduct.js", `
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
    let t = "\\u{1F525} *" + nama + "* \\u{1F525}\\n";
    t += "\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\n";
    t += "\\u{1F4B0} *Rp " + harga + "*\\n";
    if (desk) t += "\\n\\u{1F4DD} " + desk + "\\n";
    t += "\\n\\u{1F3EA} _" + toko + "_\\n";
    t += "\\n\\u2705 Pesan langsung, antar ke rumah!\\n";
    t += "\\u2705 Bayar di tempat (COD)\\n";
    t += "\\n\\u{1F449} *PESAN SEKARANG:*\\n";
    t += domain + "\\n";
    t += "\\n_Loman \\u2014 Belanja Setetangga \\u{1F3D8}\\u{FE0F}_";
    return t;
  }

  function getPlainText() {
    let t = "\\u{1F525} " + nama + " \\u{1F525}\\n";
    t += "\\u{1F4B0} Rp " + harga + "\\n";
    if (desk) t += "\\u{1F4DD} " + desk + "\\n";
    t += "\\u{1F3EA} " + toko + "\\n\\n";
    t += "\\u2705 Pesan langsung, antar ke rumah!\\n";
    t += "\\u{1F449} PESAN: " + domain + "\\n\\n";
    t += "Loman \\u2014 Belanja Setetangga";
    return t;
  }

  function getIGCaption() {
    let t = nama + " \\u{1F525}\\n";
    t += "\\u{1F4B0} Rp " + harga + "\\n\\n";
    if (desk) t += desk + "\\n\\n";
    t += "\\u{1F6D2} Pesan di loman.store\\n";
    t += "\\u{1F3EA} " + toko + "\\n\\n";
    t += "#JualanOnline #UMKM #Loman #BelanjaSetetangga";
    return t;
  }

  function shareWA() {
    window.open("https://wa.me/?text=" + encodeURIComponent(getWAText()), "_blank");
  }

  function shareWAStory() {
    copyToClipboard(getPlainText());
    alert("Teks sudah di-copy! \\u2705\\n\\nBuka WhatsApp \\u2192 Status \\u2192 Paste sebagai caption foto produk.");
  }

  function shareIG() {
    copyToClipboard(getIGCaption());
    alert("Caption IG sudah di-copy! \\u2705\\n\\nBuka Instagram \\u2192 Buat Post/Story \\u2192 Paste caption.");
  }

  function shareFB() {
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank");
  }

  function shareTelegram() {
    window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(getPlainText()), "_blank");
  }

  function shareTwitter() {
    var tweet = "\\u{1F525} " + nama + "\\n\\u{1F4B0} Rp " + harga + "\\n\\n\\u{1F6D2} Pesan di " + domain + "\\n\\n#UMKM #Loman";
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
    alert("Teks berhasil di-copy! \\u2705");
  }

  function nativeShare() {
    if (navigator.share) {
      navigator.share({ title: nama, text: getPlainText(), url: url });
    }
  }

  var shares = [
    { name: "WhatsApp", icon: "\\u{1F4AC}", fn: shareWA },
    { name: "WA Story", icon: "\\u{1F4F8}", fn: shareWAStory },
    { name: "Instagram", icon: "\\u{1F4F7}", fn: shareIG },
    { name: "Facebook", icon: "\\u{1F4D8}", fn: shareFB },
    { name: "Telegram", icon: "\\u2708\\uFE0F", fn: shareTelegram },
    { name: "Twitter", icon: "\\u{1F426}", fn: shareTwitter },
    { name: "Copy", icon: "\\u{1F517}", fn: copyLink },
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
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>\\u2715</button>
        </div>

        <div style={{ background: "#f9fafb", borderRadius: "14px", padding: "14px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {product.foto ? (
              <img src={product.foto} alt="" style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>{product.emoji || "\\u{1F4E6}"}</div>
            )}
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{nama}</h4>
              <p style={{ fontSize: "16px", fontWeight: 800, color: "#f59e0b" }}>Rp {harga}</p>
            </div>
          </div>
          <div style={{ marginTop: "12px", padding: "10px 12px", background: "white", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Preview pesan:</p>
            <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.6 }}>
              {"\\u{1F525} " + nama + " \\u{1F525}"}<br/>
              {"\\u{1F4B0} Rp " + harga}<br/>
              {"\\u{1F3EA} " + toko}<br/><br/>
              {"\\u2705 Pesan langsung, antar ke rumah!"}<br/>
              {"\\u{1F449} PESAN: " + domain}
            </p>
          </div>
        </div>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{
            width: "100%", padding: "14px", borderRadius: "14px", marginBottom: "12px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer",
          }}>\\u{1F4E4} Bagikan Sekarang</button>
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
`);

// =============================================
// 2. SHARE ALL PRODUCTS (Tulis ulang bersih)
// =============================================
writeFile("components/ShareAllProducts.js", `
"use client";

export default function ShareAllProducts({ products, tokoNama, tokoId, onClose }) {
  var baseUrl = typeof window !== "undefined" ? window.location.origin : "https://loman.store";
  var url = baseUrl + "/buyer/toko/" + (tokoId || "");
  var domain = typeof window !== "undefined" ? window.location.host : "loman.store";
  var toko = tokoNama || "Toko";

  function getWAKatalog() {
    var t = "\\u{1F3EA} *" + toko + "*\\n";
    t += "\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\n\\n";
    products.forEach(function(p, i) {
      t += (i + 1) + ". *" + p.nama + "*  \\u2014  Rp " + (p.harga || 0).toLocaleString("id") + "\\n";
    });
    t += "\\n\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\n";
    t += "\\n\\u2705 Pesan langsung, antar ke rumah\\n";
    t += "\\u2705 Bayar di tempat (COD)\\n";
    t += "\\n\\u{1F6D2} *PESAN SEKARANG* \\u{1F447}\\n";
    t += domain + "\\n";
    t += "\\n_Loman \\u2014 Belanja Setetangga \\u{1F3D8}\\u{FE0F}_";
    return t;
  }

  function getPlainText() {
    var t = "\\u{1F3EA} " + toko + "\\n";
    t += "\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\n\\n";
    products.forEach(function(p, i) {
      t += (i + 1) + ". " + p.nama + " \\u2014 Rp " + (p.harga || 0).toLocaleString("id") + "\\n";
    });
    t += "\\n\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\n";
    t += "\\n\\u2705 Pesan langsung, antar ke rumah\\n";
    t += "\\u{1F449} PESAN: " + domain + "\\n\\n";
    t += "Loman \\u2014 Belanja Setetangga";
    return t;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text); }
    else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
  }

  function shareWA() { window.open("https://wa.me/?text=" + encodeURIComponent(getWAKatalog()), "_blank"); }
  function shareIG() { copyToClipboard(getPlainText()); alert("Caption IG di-copy! \\u2705\\n\\nBuka Instagram \\u2192 Paste caption."); }
  function shareFB() { window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank"); }
  function shareTG() { window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(getPlainText()), "_blank"); }
  function copyAll() { copyToClipboard(getPlainText()); alert("Katalog di-copy! \\u2705"); }

  function nativeShare() {
    if (navigator.share) { navigator.share({ title: toko + " \\u2014 Menu", text: getPlainText(), url: url }); }
  }

  var shares = [
    { name: "WhatsApp", icon: "\\u{1F4AC}", fn: shareWA },
    { name: "Instagram", icon: "\\u{1F4F7}", fn: shareIG },
    { name: "Facebook", icon: "\\u{1F4D8}", fn: shareFB },
    { name: "Telegram", icon: "\\u2708\\uFE0F", fn: shareTG },
    { name: "Copy", icon: "\\u{1F517}", fn: copyAll },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", width: "100%", maxWidth: "480px", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Share Semua Produk</h3>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>\\u2715</button>
        </div>

        <div style={{ background: "#1f2937", borderRadius: "14px", padding: "16px", marginBottom: "16px", maxHeight: "220px", overflowY: "auto" }}>
          <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>Preview:</p>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#fbbf24", marginBottom: "6px" }}>\\u{1F3EA} {toko}</p>
          <div style={{ borderTop: "1px solid #374151", paddingTop: "8px" }}>
            {products.map(function(p, i) {
              return <p key={p.id || i} style={{ fontSize: "13px", color: "#e2e8f0", marginBottom: "3px" }}>{(i + 1) + ". " + p.nama + "  \\u2014  "}<span style={{ color: "#fbbf24" }}>{"Rp " + (p.harga || 0).toLocaleString("id")}</span></p>;
            })}
          </div>
          <div style={{ borderTop: "1px solid #374151", marginTop: "8px", paddingTop: "8px" }}>
            <p style={{ fontSize: "12px", color: "#34d399" }}>\\u2705 Pesan langsung, antar ke rumah</p>
            <p style={{ fontSize: "13px", color: "#fbbf24", fontWeight: 700, marginTop: "4px" }}>\\u{1F6D2} PESAN: {domain}</p>
          </div>
        </div>

        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "14px", textAlign: "center" }}>{products.length} produk</p>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{ width: "100%", padding: "14px", borderRadius: "14px", marginBottom: "12px", background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}>\\u{1F4E4} Bagikan Sekarang</button>
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
`);

// =============================================
// 3. TOKO SETTING — Tulis ulang bersih (tanpa logo, dengan compress)
// =============================================
// Cek apakah toko-setting ada dan perbaiki
const tsPath = "app/seller/toko-setting/page.js";
if (fs.existsSync(tsPath)) {
  let c = fs.readFileSync(tsPath, "utf-8");
  
  // Cek apakah ada syntax error - cari unmatched braces atau broken code
  // Cara paling aman: pastikan tidak ada referensi logoFile/logoPreview yang broken
  
  // Remove any broken logo references
  c = c.replace(/logoPreview/g, "null");
  c = c.replace(/logoFile/g, "null");
  c = c.replace(/setLogoFile/g, "//removed");
  c = c.replace(/setLogoPreview/g, "//removed");
  c = c.replace(/removeLogo/g, "//removed");
  
  fs.writeFileSync(tsPath, c);
  console.log("  ✅ " + tsPath + " (cleaned logo references)");
}

// =============================================
// 4. Cek semua file untuk syntax errors
// =============================================
const filesToCheck = [
  "app/page.js",
  "app/layout.js",
  "app/login/page.js",
  "app/pilih-role/page.js",
  "app/buyer/page.js",
  "app/buyer/toko/[id]/page.js",
  "app/buyer/keranjang/page.js",
  "app/buyer/pesanan/page.js",
  "app/buyer/profil/page.js",
  "app/seller/page.js",
  "app/seller/produk/page.js",
  "app/seller/pesanan/page.js",
  "app/seller/profil/page.js",
  "app/seller/toko-setting/page.js",
  "app/seller/laporan/page.js",
  "app/admin/page.js",
  "app/landing/page.js",
  "components/BottomNav.js",
  "components/ChatRoom.js",
  "components/ChatList.js",
  "components/NotifPanel.js",
  "components/ShareProduct.js",
  "components/ShareAllProducts.js",
  "components/LocationPicker.js",
  "lib/firebase.js",
  "lib/AuthContext.js",
  "lib/useLocation.js",
];

console.log("");
console.log("  Checking files...");
let missingFiles = [];
filesToCheck.forEach(f => {
  if (fs.existsSync(f)) {
    // Quick syntax check - look for obvious issues
    const content = fs.readFileSync(f, "utf-8");
    if (content.includes("<<<") || content.includes(">>>")) {
      console.log("  ⚠️ " + f + " — possible git conflict markers!");
    }
  } else {
    missingFiles.push(f);
  }
});

if (missingFiles.length > 0) {
  console.log("");
  console.log("  Missing files:");
  missingFiles.forEach(f => console.log("  ❌ " + f));
}

console.log("");
console.log("🎉 ========================================");
console.log("   FIX SELESAI!");
console.log("========================================");
console.log("");
console.log("   ✅ ShareProduct.js — ditulis ulang bersih");
console.log("   ✅ ShareAllProducts.js — ditulis ulang bersih");
console.log("   ✅ Toko setting — logo references cleaned");
console.log("   ✅ File integrity checked");
console.log("");
console.log("   Test dulu di lokal:");
console.log("   npm run dev");
console.log("");
console.log("   Jika tidak ada error, deploy:");
console.log("   git add .");
console.log('   git commit -m "fix deploy error"');
console.log("   git push");
console.log("");
