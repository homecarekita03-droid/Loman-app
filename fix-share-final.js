// ============================================
// 🔧 Fix Share + Ganti Tanaman → Sayuran
// ============================================
// Jalankan: node fix-share-final.js
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
console.log("🔧 Fix Share + Kategori...");
console.log("");

// =============================================
// 1. SHARE PRODUCT — Tulis ulang 100% bersih
// =============================================
writeFile("components/ShareProduct.js", `
"use client";
import { useState } from "react";

export default function ShareProduct({ product, tokoNama, onClose }) {
  var baseUrl = typeof window !== "undefined" ? window.location.origin : "https://loman.store";
  var tokoUrl = baseUrl + "/buyer/toko/" + (product.tokoId || "");
  var domain = typeof window !== "undefined" ? window.location.host : "loman.store";
  var nama = product.nama || "Produk";
  var harga = "Rp " + (product.harga || 0).toLocaleString("id");
  var desk = product.deskripsi || "";
  var toko = tokoNama || "Toko di Loman";
  var [copied, setCopied] = useState(false);

  var waMsg = [
    "\\ud83d\\udd25 *" + nama + "* \\ud83d\\udd25",
    "\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501",
    "\\ud83d\\udcb0 *" + harga + "*",
    desk ? "" : null,
    desk ? "\\ud83d\\udcdd " + desk : null,
    "",
    "\\ud83c\\udfea _" + toko + "_",
    "",
    "\\u2705 Pesan langsung, antar ke rumah!",
    "\\u2705 Bayar di tempat (COD)",
    "",
    "\\ud83d\\udc49 *PESAN SEKARANG:*",
    domain,
    "",
    "_Loman \\u2014 Belanja Setetangga \\ud83c\\udfe8_",
  ].filter(function(x) { return x !== null; }).join("\\n");

  var plainMsg = [
    "\\ud83d\\udd25 " + nama + " \\ud83d\\udd25",
    "\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501",
    "\\ud83d\\udcb0 " + harga,
    desk ? "\\ud83d\\udcdd " + desk : null,
    "\\ud83c\\udfea " + toko,
    "",
    "\\u2705 Pesan langsung, antar ke rumah!",
    "\\ud83d\\udc49 PESAN: " + domain,
    "",
    "Loman \\u2014 Belanja Setetangga",
  ].filter(function(x) { return x !== null; }).join("\\n");

  var igMsg = [
    nama + " \\ud83d\\udd25",
    "\\ud83d\\udcb0 " + harga,
    "",
    desk || "",
    "",
    "\\ud83d\\uded2 Pesan di " + domain,
    "\\ud83c\\udfea " + toko,
    "",
    "#JualanOnline #UMKM #Loman #BelanjaSetetangga #MakananRumahan",
  ].join("\\n");

  function doCopy(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      var t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
  }

  var buttons = [
    {
      name: "WhatsApp", icon: "\\ud83d\\udcac",
      fn: function() { window.open("https://wa.me/?text=" + encodeURIComponent(waMsg), "_blank"); }
    },
    {
      name: "WA Story", icon: "\\ud83d\\udcf8",
      fn: function() { doCopy(plainMsg); alert("Teks di-copy! \\u2705\\n\\nBuka WA > Status > Paste sebagai caption."); }
    },
    {
      name: "Instagram", icon: "\\ud83d\\udcf7",
      fn: function() { doCopy(igMsg); alert("Caption IG di-copy! \\u2705\\n\\nBuka IG > Buat Post > Paste."); }
    },
    {
      name: "Facebook", icon: "\\ud83d\\udcd8",
      fn: function() { window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(tokoUrl) + "&quote=" + encodeURIComponent(plainMsg), "_blank"); }
    },
    {
      name: "Telegram", icon: "\\u2708\\ufe0f",
      fn: function() { window.open("https://t.me/share/url?url=" + encodeURIComponent(tokoUrl) + "&text=" + encodeURIComponent(plainMsg), "_blank"); }
    },
    {
      name: "Twitter", icon: "\\ud83d\\udc26",
      fn: function() { window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent("\\ud83d\\udd25 " + nama + "\\n\\ud83d\\udcb0 " + harga + "\\n\\n\\ud83d\\uded2 " + domain + "\\n\\n#UMKM #Loman"), "_blank"); }
    },
    {
      name: "Copy", icon: "\\ud83d\\udd17",
      fn: function() { doCopy(plainMsg); setCopied(true); setTimeout(function() { setCopied(false); }, 2000); }
    },
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"white", width:"100%", maxWidth:"480px", borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto", animation:"slideUp 0.3s ease" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:800 }}>\\ud83d\\udce4 Bagikan Produk</h3>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"16px" }}>\\u2715</button>
        </div>

        <div style={{ background:"#f9fafb", borderRadius:"14px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
            {product.foto
              ? <img src={product.foto} alt="" style={{ width:"56px", height:"56px", borderRadius:"12px", objectFit:"cover" }} />
              : <div style={{ width:"56px", height:"56px", borderRadius:"12px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>{product.emoji || "\\ud83d\\udce6"}</div>
            }
            <div>
              <h4 style={{ fontSize:"15px", fontWeight:700 }}>{nama}</h4>
              <p style={{ fontSize:"16px", fontWeight:800, color:"#f59e0b" }}>{harga}</p>
            </div>
          </div>

          <div style={{ marginTop:"12px", padding:"10px 12px", background:"white", borderRadius:"10px", border:"1px solid #e5e7eb" }}>
            <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"6px" }}>Preview pesan:</p>
            <div style={{ fontSize:"12px", color:"#374151", lineHeight:1.7 }}>
              <p>\\ud83d\\udd25 {nama} \\ud83d\\udd25</p>
              <p>\\ud83d\\udcb0 {harga}</p>
              <p>\\ud83c\\udfea {toko}</p>
              <p style={{ marginTop:"6px" }}>\\u2705 Pesan langsung, antar ke rumah!</p>
              <p style={{ fontWeight:700, color:"#f59e0b" }}>\\ud83d\\udc49 PESAN: {domain}</p>
            </div>
          </div>
        </div>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={function() { navigator.share({ title:nama, text:plainMsg, url:tokoUrl }); }} style={{
            width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px",
            background:"linear-gradient(135deg, #f59e0b, #ea580c)",
            color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer",
          }}>\\ud83d\\udce4 Bagikan Sekarang</button>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"8px" }}>
          {buttons.map(function(b) {
            return (
              <button key={b.name} onClick={b.fn} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
                padding:"14px 4px", borderRadius:"14px", border:"none",
                background: (b.name === "Copy" && copied) ? "#d1fae5" : "#f9fafb",
                cursor:"pointer",
              }}>
                <span style={{ fontSize:"24px" }}>{b.icon}</span>
                <span style={{ fontSize:"10px", color: (b.name === "Copy" && copied) ? "#059669" : "#6b7280" }}>
                  {(b.name === "Copy" && copied) ? "Copied!" : b.name}
                </span>
              </button>
            );
          })}
        </div>

        <p style={{ textAlign:"center", fontSize:"11px", color:"#d1d5db", marginTop:"16px" }}>
          Tip: Share dengan foto produk untuk hasil lebih menarik!
        </p>
      </div>
    </div>
  );
}
`);

// =============================================
// 2. SHARE ALL PRODUCTS — Tulis ulang bersih
// =============================================
writeFile("components/ShareAllProducts.js", `
"use client";
import { useState } from "react";

export default function ShareAllProducts({ products, tokoNama, tokoId, onClose }) {
  var baseUrl = typeof window !== "undefined" ? window.location.origin : "https://loman.store";
  var tokoUrl = baseUrl + "/buyer/toko/" + (tokoId || "");
  var domain = typeof window !== "undefined" ? window.location.host : "loman.store";
  var toko = tokoNama || "Toko";
  var [copied, setCopied] = useState(false);

  function buildList() {
    return products.map(function(p, i) {
      return (i + 1) + ". " + p.nama + "  \\u2014  Rp " + (p.harga || 0).toLocaleString("id");
    }).join("\\n");
  }

  var waMsg = [
    "\\ud83c\\udfea *" + toko + "*",
    "\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501",
    "",
    buildList(),
    "",
    "\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501\\u2501",
    "\\u2705 Pesan langsung, antar ke rumah",
    "\\u2705 Bayar di tempat (COD)",
    "",
    "\\ud83d\\uded2 *PESAN SEKARANG* \\ud83d\\udc47",
    domain,
    "",
    "_Loman \\u2014 Belanja Setetangga \\ud83c\\udfe8_",
  ].join("\\n");

  var plainMsg = waMsg.replace(/\\*/g, "").replace(/_/g, "");

  function doCopy(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text); }
    else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); }
  }

  var buttons = [
    { name:"WhatsApp", icon:"\\ud83d\\udcac", fn: function() { window.open("https://wa.me/?text=" + encodeURIComponent(waMsg), "_blank"); } },
    { name:"Instagram", icon:"\\ud83d\\udcf7", fn: function() { doCopy(plainMsg + "\\n\\n#UMKM #Loman #BelanjaSetetangga"); alert("Caption IG di-copy! \\u2705"); } },
    { name:"Facebook", icon:"\\ud83d\\udcd8", fn: function() { window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(tokoUrl), "_blank"); } },
    { name:"Telegram", icon:"\\u2708\\ufe0f", fn: function() { window.open("https://t.me/share/url?url=" + encodeURIComponent(tokoUrl) + "&text=" + encodeURIComponent(plainMsg), "_blank"); } },
    { name:"Copy", icon:"\\ud83d\\udd17", fn: function() { doCopy(plainMsg); setCopied(true); setTimeout(function(){ setCopied(false); }, 2000); } },
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"white", width:"100%", maxWidth:"480px", borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"85vh", overflowY:"auto", animation:"slideUp 0.3s ease" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:800 }}>\\ud83d\\udce4 Share Semua Produk</h3>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"16px" }}>\\u2715</button>
        </div>

        <div style={{ background:"#1f2937", borderRadius:"14px", padding:"16px", marginBottom:"16px", maxHeight:"220px", overflowY:"auto" }}>
          <p style={{ fontSize:"11px", color:"#64748b", marginBottom:"8px" }}>Preview:</p>
          <p style={{ fontSize:"14px", fontWeight:700, color:"#fbbf24", marginBottom:"8px" }}>\\ud83c\\udfea {toko}</p>
          {products.map(function(p, i) {
            return <p key={p.id || i} style={{ fontSize:"13px", color:"#e2e8f0", marginBottom:"3px" }}>
              <span style={{ color:"#9ca3af" }}>{i + 1}.</span> {p.nama} <span style={{ color:"#fbbf24" }}>Rp {(p.harga || 0).toLocaleString("id")}</span>
            </p>;
          })}
          <div style={{ borderTop:"1px solid #374151", marginTop:"10px", paddingTop:"10px" }}>
            <p style={{ fontSize:"12px", color:"#34d399" }}>\\u2705 Pesan langsung, antar ke rumah</p>
            <p style={{ fontSize:"13px", color:"#fbbf24", fontWeight:700, marginTop:"4px" }}>\\ud83d\\uded2 PESAN: {domain}</p>
          </div>
        </div>

        <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"14px", textAlign:"center" }}>{products.length} produk</p>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={function() { navigator.share({ title:toko, text:plainMsg, url:tokoUrl }); }} style={{
            width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px",
            background:"linear-gradient(135deg, #f59e0b, #ea580c)",
            color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer",
          }}>\\ud83d\\udce4 Bagikan Sekarang</button>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"6px" }}>
          {buttons.map(function(b) {
            return (
              <button key={b.name} onClick={b.fn} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
                padding:"12px 4px", borderRadius:"14px", border:"none",
                background: (b.name === "Copy" && copied) ? "#d1fae5" : "#f9fafb",
                cursor:"pointer",
              }}>
                <span style={{ fontSize:"24px" }}>{b.icon}</span>
                <span style={{ fontSize:"9px", color: (b.name === "Copy" && copied) ? "#059669" : "#6b7280" }}>
                  {(b.name === "Copy" && copied) ? "Copied!" : b.name}
                </span>
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
// 3. Ganti kategori Tanaman → Sayuran di SEMUA file
// =============================================
var filesToFix = [
  "app/buyer/page.js",
  "app/seller/produk/page.js",
  "app/seller/toko-setting/page.js",
];

filesToFix.forEach(function(fp) {
  if (fs.existsSync(fp)) {
    var c = fs.readFileSync(fp, "utf-8");
    var changed = false;

    // Ganti label
    if (c.includes('"Tanaman"')) {
      c = c.replace(/"Tanaman"/g, '"Sayuran"');
      changed = true;
    }

    // Ganti id
    if (c.includes('"tanaman"')) {
      c = c.replace(/"tanaman"/g, '"sayuran"');
      changed = true;
    }

    // Ganti emoji tanaman ke sayuran
    if (c.includes('"\\u{1F33F}"') || c.includes('"🌿"')) {
      c = c.replace(/"🌿"/g, '"🥬"');
      c = c.replace(/"\\u{1F33F}"/g, '"🥬"');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(fp, c);
      console.log("  ✅ " + fp + " (Tanaman → Sayuran)");
    } else {
      console.log("  ℹ️ " + fp + " (tidak ada perubahan)");
    }
  }
});

console.log("");
console.log("🎉 ========================================");
console.log("   SELESAI!");
console.log("========================================");
console.log("");
console.log("   ✅ ShareProduct.js — ditulis ulang 100% bersih");
console.log("   ✅ ShareAllProducts.js — ditulis ulang 100% bersih");
console.log("   ✅ Tanaman → Sayuran (semua file)");
console.log("");
console.log("   Test: npm run dev");
console.log("   Deploy: git add . && git commit -m 'fix share + sayuran' && git push");
console.log("");
