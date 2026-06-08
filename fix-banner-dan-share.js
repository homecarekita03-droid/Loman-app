// ============================================
// 🔧 Fix Banner (hapus logo) + Share Format Pro
// ============================================
// Jalankan: node fix-banner-dan-share.js
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
console.log("   Fix Banner + Share Format Pro");
console.log("========================================");
console.log("");

// =============================================
// 1. SHARE PRODUCT — Format CTA Kuat
// =============================================
writeFile("components/ShareProduct.js", `
"use client";

export default function ShareProduct({ product, tokoNama, onClose }) {
  const url = typeof window !== "undefined" ? window.location.origin + "/buyer/toko/" + product.tokoId : "loman.store";
  const domain = typeof window !== "undefined" ? window.location.host : "loman.store";

  // Format WA (dengan bold/italic markdown)
  const waText = "🔥 *" + product.nama + "* 🔥\\n"
    + "━━━━━━━━━━━━━━━\\n"
    + "💰 *Rp " + (product.harga||0).toLocaleString("id") + "*\\n"
    + (product.deskripsi ? "\\n📝 " + product.deskripsi + "\\n" : "")
    + "\\n🏪 _" + (tokoNama||"Toko di Loman") + "_\\n"
    + "\\n✅ Pesan langsung, antar ke rumah!\\n"
    + "✅ Bayar di tempat (COD)\\n"
    + "\\n👉 *PESAN SEKARANG:*\\n"
    + domain + "\\n"
    + "\\n_Loman — Belanja Setetangga 🏘️_";

  // Format biasa (untuk copy/FB/Twitter)
  const plainText = "🔥 " + product.nama + " 🔥\\n"
    + "━━━━━━━━━━━━━━━\\n"
    + "💰 Rp " + (product.harga||0).toLocaleString("id") + "\\n"
    + (product.deskripsi ? "📝 " + product.deskripsi + "\\n" : "")
    + "🏪 " + (tokoNama||"") + "\\n"
    + "\\n✅ Pesan langsung, antar ke rumah!\\n"
    + "👉 PESAN: " + domain + "\\n"
    + "\\nLoman — Belanja Setetangga 🏘️";

  const shares = [
    { name: "WhatsApp", icon: "💬", color: "#25D366",
      action: () => window.open("https://wa.me/?text=" + encodeURIComponent(waText), "_blank") },
    { name: "WA Story", icon: "📸", color: "#25D366",
      action: () => {
        // Copy ke clipboard lalu instruksi user
        navigator.clipboard?.writeText(waText.replace(/\\\\n/g,"\\n").replace(/[*_]/g,""));
        alert("Teks sudah di-copy! ✅\\n\\nSekarang buka WhatsApp → Status → Paste teks ini sebagai caption foto produk Anda.");
      }},
    { name: "Instagram", icon: "📷", color: "#E1306C",
      action: () => {
        navigator.clipboard?.writeText(
          product.nama + " 🔥\\n"
          + "💰 Rp " + (product.harga||0).toLocaleString("id") + "\\n"
          + "\\n" + (product.deskripsi||"") + "\\n"
          + "\\n🛒 Pesan di loman.store\\n"
          + "🏪 " + (tokoNama||"") + "\\n"
          + "\\n#JualanOnline #UMKM #Loman #BelanjaSetetangga #" + (product.nama||"").replace(/\\s/g,"")
        );
        alert("Caption sudah di-copy! ✅\\n\\nSekarang buka Instagram → Buat Post/Story → Paste sebagai caption.");
      }},
    { name: "Facebook", icon: "📘", color: "#1877F2",
      action: () => window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) + "&quote=" + encodeURIComponent(plainText), "_blank") },
    { name: "Telegram", icon: "✈️", color: "#0088cc",
      action: () => window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(plainText), "_blank") },
    { name: "Twitter", icon: "🐦", color: "#1DA1F2",
      action: () => window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(
        "🔥 " + product.nama + "\\n💰 Rp " + (product.harga||0).toLocaleString("id")
        + "\\n\\n🛒 Pesan di " + domain
        + "\\n\\n#UMKM #Loman #BelanjaSetetangga"
      ), "_blank") },
    { name: "Copy", icon: "🔗", color: "#6b7280",
      action: () => {
        navigator.clipboard?.writeText(waText.replace(/\\\\n/g,"\\n").replace(/[*_]/g,"")).then(()=>{
          alert("Teks berhasil di-copy! ✅\\nPaste di mana saja.");
        }).catch(()=>{ prompt("Copy teks ini:", plainText); });
      }},
  ];

  function nativeShare() {
    if (navigator.share) {
      navigator.share({
        title: product.nama + " — " + (tokoNama||"Loman"),
        text: plainText.replace(/\\\\n/g,"\\n"),
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
              {"🔥 " + product.nama + " 🔥\\n💰 Rp " + (product.harga||0).toLocaleString("id") + "\\n🏪 " + (tokoNama||"") + "\\n\\n✅ Pesan langsung, antar ke rumah!\\n👉 PESAN: " + domain}
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
`);

// =============================================
// 2. SHARE ALL PRODUCTS — Format CTA Kuat
// =============================================
writeFile("components/ShareAllProducts.js", `
"use client";

export default function ShareAllProducts({ products, tokoNama, tokoId, onClose }) {
  const url = typeof window !== "undefined" ? window.location.origin + "/buyer/toko/" + tokoId : "loman.store";
  const domain = typeof window !== "undefined" ? window.location.host : "loman.store";

  // WA format (bold/italic)
  let waKatalog = "🏪 *" + tokoNama + "*\\n";
  waKatalog += "━━━━━━━━━━━━━━━━━\\n\\n";
  
  products.forEach((p, i) => {
    waKatalog += (i+1) + ". *" + p.nama + "*  —  Rp " + (p.harga||0).toLocaleString("id") + "\\n";
  });

  waKatalog += "\\n━━━━━━━━━━━━━━━━━\\n";
  waKatalog += "\\n✅ Pesan langsung, antar ke rumah\\n";
  waKatalog += "✅ Bayar di tempat (COD)\\n";
  waKatalog += "\\n🛒 *PESAN SEKARANG* 👇\\n";
  waKatalog += domain + "\\n";
  waKatalog += "\\n_Loman — Belanja Setetangga 🏘️_";

  // IG format
  const igCaption = "🏪 " + tokoNama + "\\n\\n"
    + "📋 Menu/Produk Kami:\\n"
    + products.map((p,i) => (i+1) + ". " + p.nama + " — Rp " + (p.harga||0).toLocaleString("id")).join("\\n")
    + "\\n\\n🛒 Pesan di loman.store\\n"
    + "✅ Antar ke rumah • Bayar COD\\n"
    + "\\n#JualanOnline #UMKM #Loman #BelanjaSetetangga #" + (tokoNama||"").replace(/\\s/g,"");

  const shares = [
    { name: "WhatsApp", icon: "💬",
      action: () => window.open("https://wa.me/?text=" + encodeURIComponent(waKatalog), "_blank") },
    { name: "Instagram", icon: "📷",
      action: () => {
        navigator.clipboard?.writeText(igCaption.replace(/\\\\n/g,"\\n"));
        alert("Caption IG sudah di-copy! ✅\\n\\nBuka Instagram → Buat Post → Paste caption.");
      }},
    { name: "Facebook", icon: "📘",
      action: () => window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank") },
    { name: "Telegram", icon: "✈️",
      action: () => window.open("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(waKatalog), "_blank") },
    { name: "Copy", icon: "🔗",
      action: () => {
        navigator.clipboard?.writeText(waKatalog.replace(/\\\\n/g,"\\n").replace(/[*_]/g,"")).then(()=>{
          alert("Katalog di-copy! ✅");
        });
      }},
  ];

  function nativeShare() {
    if (navigator.share) {
      navigator.share({
        title: tokoNama + " — Menu Lengkap",
        text: waKatalog.replace(/\\\\n/g,"\\n").replace(/[*_]/g,""),
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
`);

// =============================================
// 3. Fix Toko Setting — Hapus Logo, Perbaiki Banner
// =============================================
const tokoSettingPath = "app/seller/toko-setting/page.js";
if (fs.existsSync(tokoSettingPath)) {
  let c = fs.readFileSync(tokoSettingPath, "utf-8");

  // Hapus semua referensi logo
  // Remove logo state
  c = c.replace(/const \[logoFile.*?\n/g, "");
  c = c.replace(/const \[logoPreview.*?\n/g, "");
  
  // Remove logo preview in banner area
  c = c.replace(/\{logoPreview && <div style=\{.*?<\/div>\}/gs, "");
  
  // Remove logo upload section entirely  
  // Find and remove the logo upload card
  c = c.replace(/\{\/\* Logo \*\/\}[\s\S]*?\{\/\* Emoji \*\/\}/, "{/* Emoji */}");
  
  // Remove logo from preview
  c = c.replace(/padding: logoPreview \?.*?: "12px 14px"/g, 'padding: "12px 14px"');
  c = c.replace(/padding: logoPreview \?.*?: "14px"/g, 'padding: "14px"');

  // Remove logo upload in save function
  c = c.replace(/if \(logoFile\).*?setBannerFile\(null\);\s*\}/s, function(match) {
    // Keep only banner upload part
    return match.replace(/if \(logoFile\).*?setLogoFile\(null\);\s*\}/, "");
  });

  // Remove logo from removeLogo function
  c = c.replace(/async function removeLogo.*?\}/s, "");

  // Compress banner - kurangi resolusi untuk upload lebih cepat
  // Replace handleImageSelect to add compression
  c = c.replace(
    'function handleImageSelect(e, type) {',
    `function compressImage(file, maxWidth, quality) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  function handleImageSelect(e, type) {`
  );

  // Replace the reader part to use compression
  c = c.replace(
    /const reader = new FileReader\(\);\s*reader\.onloadend = \(\) => \{[^}]*\};\s*reader\.readAsDataURL\(file\);/,
    `// Compress gambar sebelum preview & upload
    compressImage(file, 1200, 0.7).then(blob => {
      const compressedFile = new File([blob], file.name, { type: "image/jpeg" });
      if (type === "banner") { setBannerFile(compressedFile); }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "banner") setBannerPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    });`
  );

  fs.writeFileSync(tokoSettingPath, c);
  console.log("  ✅ " + tokoSettingPath + " (logo removed, banner compressed)");
}

// =============================================
// 4. Fix Buyer Home — Hapus logo dari store cards
// =============================================
const buyerPath = "app/buyer/page.js";
if (fs.existsSync(buyerPath)) {
  let c = fs.readFileSync(buyerPath, "utf-8");
  
  // Remove logo overlay from store cards
  c = c.replace(/\{s\.logo && <div style=\{.*?\}\}\}<\/div>\}/g, "");
  
  // Fix padding
  c = c.replace(/padding: s\.logo \? "24px 16px 14px" : "14px 16px"/g, '"14px 16px"');

  fs.writeFileSync(buyerPath, c);
  console.log("  ✅ " + buyerPath + " (logo removed from cards)");
}

// =============================================
// 5. Fix Buyer Toko Detail — Hapus logo
// =============================================
const detailPath = "app/buyer/toko/[id]/page.js";
if (fs.existsSync(detailPath)) {
  let c = fs.readFileSync(detailPath, "utf-8");

  // Remove logo overlay
  c = c.replace(/\{store\.logo && <div style=\{.*?\}\}\}<\/div>\}/g, "");
  
  // Fix padding
  c = c.replace(/paddingTop: store\.logo \? "36px" : "20px"/g, '"20px"');

  fs.writeFileSync(detailPath, c);
  console.log("  ✅ " + detailPath + " (logo removed from detail)");
}

console.log("");
console.log("🎉 ========================================");
console.log("   FIX SELESAI!");
console.log("========================================");
console.log("");
console.log("   🖼️ BANNER:");
console.log("   ✅ Logo dihapus (hanya banner)");
console.log("   ✅ Gambar otomatis di-compress sebelum upload");
console.log("   ✅ Max lebar 1200px, kualitas 70% (hemat bandwidth)");
console.log("   ✅ Upload lebih cepat, tidak buffer lagi");
console.log("");
console.log("   📤 SHARE PRODUK (Format Baru):");
console.log("   ✅ Format WA: bold, emoji, CTA kuat");
console.log("   ✅ Caption IG: hashtag otomatis");
console.log("   ✅ WA Story: copy + instruksi jelas");
console.log("   ✅ Preview pesan sebelum kirim");
console.log("   ✅ Domain loman.store di setiap share");
console.log("   ✅ Tombol 'Bagikan Sekarang' (native share)");
console.log("");
console.log("   📤 SHARE SEMUA PRODUK (Katalog):");
console.log("   ✅ Format rapi bernomor");
console.log("   ✅ Dark preview (terlihat profesional)");
console.log("   ✅ CTA: 'PESAN SEKARANG' + link");
console.log("   ✅ Support WA, IG, FB, Telegram, Copy");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Deploy:  git add . && git commit -m 'fix banner share' && git push");
console.log("");
