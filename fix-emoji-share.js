// Fix emoji di Share components
const fs = require("fs");
const path = require("path");
function writeFile(fp, c) { const d = path.dirname(fp); if (!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true}); fs.writeFileSync(fp, c.trimStart()); console.log("  ✅ "+fp); }
console.log("🔧 Fix emoji share...");

writeFile("components/ShareAllProducts.js", String.raw`
"use client";
import { useState } from "react";

export default function ShareAllProducts(props) {
  var products = props.products || [];
  var tokoNama = props.tokoNama || "Toko";
  var tokoId = props.tokoId || "";
  var onClose = props.onClose;
  var [copied, setCopied] = useState(false);

  var domain = "loman.store";
  var tokoLink = domain + "/buyer/toko/" + tokoId;

  function buildWA() {
    var lines = [];
    lines.push("\uD83C\uDFEA *" + tokoNama + "*");
    lines.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    lines.push("");
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      lines.push((i+1) + ". *" + p.nama + "*  \u2014  Rp " + (p.harga||0).toLocaleString("id"));
    }
    lines.push("");
    lines.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    lines.push("\u2705 Pesan langsung, antar ke rumah");
    lines.push("\u2705 Bayar di tempat (COD)");
    lines.push("");
    lines.push("\uD83D\uDED2 *PESAN SEKARANG* \uD83D\uDC47");
    lines.push(tokoLink);
    lines.push("");
    lines.push("_Loman \u2014 Belanja Setetangga_");
    return lines.join("\n");
  }

  function buildPlain() {
    var lines = [];
    lines.push("\uD83C\uDFEA " + tokoNama);
    lines.push("");
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      lines.push((i+1) + ". " + p.nama + " - Rp " + (p.harga||0).toLocaleString("id"));
    }
    lines.push("");
    lines.push("\u2705 Pesan langsung, antar ke rumah");
    lines.push("\uD83D\uDC49 PESAN: " + tokoLink);
    lines.push("");
    lines.push("Loman - Belanja Setetangga");
    return lines.join("\n");
  }

  function doCopy(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text); }
    else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"white", width:"100%", maxWidth:"480px", borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"85vh", overflowY:"auto", animation:"slideUp 0.3s ease" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:800 }}>📤 Share Semua Produk</h3>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"16px" }}>✕</button>
        </div>

        <div style={{ background:"#1f2937", borderRadius:"14px", padding:"16px", marginBottom:"16px", maxHeight:"220px", overflowY:"auto" }}>
          <p style={{ fontSize:"11px", color:"#64748b", marginBottom:"8px" }}>Preview:</p>
          <p style={{ fontSize:"14px", fontWeight:700, color:"#fbbf24", marginBottom:"8px" }}>🏪 {tokoNama}</p>
          {products.map(function(p, i) {
            return <p key={i} style={{ fontSize:"13px", color:"#e2e8f0", marginBottom:"3px" }}>
              <span style={{ color:"#9ca3af" }}>{i+1}.</span> {p.nama} <span style={{ color:"#fbbf24" }}>Rp {(p.harga||0).toLocaleString("id")}</span>
            </p>;
          })}
          <div style={{ borderTop:"1px solid #374151", marginTop:"10px", paddingTop:"10px" }}>
            <p style={{ fontSize:"12px", color:"#34d399" }}>✅ Pesan langsung, antar ke rumah</p>
            <p style={{ fontSize:"13px", color:"#fbbf24", fontWeight:700, marginTop:"4px" }}>🛒 PESAN: {tokoLink}</p>
          </div>
        </div>

        <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"14px", textAlign:"center" }}>{products.length} produk akan dibagikan</p>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={function() { navigator.share({ title: tokoNama, text: buildPlain(), url: "https://"+tokoLink }); }} style={{ width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px", background:"linear-gradient(135deg, #f59e0b, #ea580c)", color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer" }}>
            📤 Bagikan Sekarang
          </button>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"6px" }}>
          <button onClick={function(){window.open("https://wa.me/?text="+encodeURIComponent(buildWA()),"_blank");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#25D366", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"20px", fontWeight:700 }}>W</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>WhatsApp</span>
          </button>
          <button onClick={function(){doCopy(buildPlain()+"\n\n#UMKM #Loman #BelanjaSetetangga");alert("Caption IG di-copy! ✅");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"linear-gradient(135deg, #833AB4, #E1306C, #F77737)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"18px", fontWeight:700 }}>IG</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>Instagram</span>
          </button>
          <button onClick={function(){window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://"+tokoLink),"_blank");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#1877F2", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"18px", fontWeight:700 }}>f</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>Facebook</span>
          </button>
          <button onClick={function(){window.open("https://t.me/share/url?url="+encodeURIComponent("https://"+tokoLink)+"&text="+encodeURIComponent(buildPlain()),"_blank");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#0088cc", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"18px", fontWeight:700 }}>T</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>Telegram</span>
          </button>
          <button onClick={function(){doCopy(buildPlain());setCopied(true);setTimeout(function(){setCopied(false);},2000);}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background: copied ? "#d1fae5" : "#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background: copied ? "#10b981" : "#6b7280", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize: copied ? "16px" : "18px", fontWeight:700 }}>{copied ? "✓" : "🔗"}</span>
            </div>
            <span style={{ fontSize:"10px", color: copied ? "#059669" : "#374151", fontWeight:500 }}>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
`);

writeFile("components/ShareProduct.js", String.raw`
"use client";
import { useState } from "react";

export default function ShareProduct(props) {
  var product = props.product || {};
  var tokoNama = props.tokoNama || "Toko";
  var onClose = props.onClose;
  var [copied, setCopied] = useState(false);

  var domain = "loman.store";
  var tokoId = product.tokoId || "";
  var tokoLink = domain + "/buyer/toko/" + tokoId;
  var nama = product.nama || "Produk";
  var harga = "Rp " + (product.harga||0).toLocaleString("id");
  var desk = product.deskripsi || "";

  function buildWA() {
    var lines = [];
    lines.push("\uD83D\uDD25 *" + nama + "* \uD83D\uDD25");
    lines.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    lines.push("\uD83D\uDCB0 *" + harga + "*");
    if (desk) { lines.push(""); lines.push("\uD83D\uDCDD " + desk); }
    lines.push("");
    lines.push("\uD83C\uDFEA _" + tokoNama + "_");
    lines.push("");
    lines.push("\u2705 Pesan langsung, antar ke rumah!");
    lines.push("\u2705 Bayar di tempat (COD)");
    lines.push("");
    lines.push("\uD83D\uDC49 *PESAN SEKARANG:*");
    lines.push(tokoLink);
    lines.push("");
    lines.push("_Loman \u2014 Belanja Setetangga_");
    return lines.join("\n");
  }

  function buildPlain() {
    var lines = [];
    lines.push("\uD83D\uDD25 " + nama + " \uD83D\uDD25");
    lines.push("\uD83D\uDCB0 " + harga);
    if (desk) lines.push("\uD83D\uDCDD " + desk);
    lines.push("\uD83C\uDFEA " + tokoNama);
    lines.push("");
    lines.push("\u2705 Pesan langsung, antar ke rumah!");
    lines.push("\uD83D\uDC49 PESAN: " + tokoLink);
    lines.push("");
    lines.push("Loman - Belanja Setetangga");
    return lines.join("\n");
  }

  function buildIG() {
    var lines = [];
    lines.push(nama + " \uD83D\uDD25");
    lines.push("\uD83D\uDCB0 " + harga);
    lines.push("");
    if (desk) { lines.push(desk); lines.push(""); }
    lines.push("\uD83D\uDED2 Pesan di " + tokoLink);
    lines.push("\uD83C\uDFEA " + tokoNama);
    lines.push("");
    lines.push("#JualanOnline #UMKM #Loman #BelanjaSetetangga");
    return lines.join("\n");
  }

  function doCopy(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text); }
    else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"white", width:"100%", maxWidth:"480px", borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto", animation:"slideUp 0.3s ease" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:800 }}>📤 Bagikan Produk</h3>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"16px" }}>✕</button>
        </div>

        <div style={{ background:"#f9fafb", borderRadius:"14px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
            {product.foto
              ? <img src={product.foto} alt="" style={{ width:"56px", height:"56px", borderRadius:"12px", objectFit:"cover" }} />
              : <div style={{ width:"56px", height:"56px", borderRadius:"12px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>{product.emoji || "📦"}</div>
            }
            <div>
              <h4 style={{ fontSize:"15px", fontWeight:700 }}>{nama}</h4>
              <p style={{ fontSize:"16px", fontWeight:800, color:"#f59e0b" }}>{harga}</p>
            </div>
          </div>
          <div style={{ marginTop:"12px", padding:"10px 12px", background:"white", borderRadius:"10px", border:"1px solid #e5e7eb" }}>
            <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"6px" }}>Preview:</p>
            <div style={{ fontSize:"12px", color:"#374151", lineHeight:1.7 }}>
              <p>🔥 {nama} 🔥</p>
              <p>💰 {harga}</p>
              <p>🏪 {tokoNama}</p>
              <p style={{ marginTop:"6px" }}>✅ Pesan langsung, antar ke rumah!</p>
              <p style={{ fontWeight:700, color:"#f59e0b" }}>👉 PESAN: {tokoLink}</p>
            </div>
          </div>
        </div>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={function(){ navigator.share({ title:nama, text:buildPlain(), url:"https://"+tokoLink }); }} style={{ width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px", background:"linear-gradient(135deg, #f59e0b, #ea580c)", color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer" }}>
            📤 Bagikan Sekarang
          </button>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"8px" }}>
          <button onClick={function(){window.open("https://wa.me/?text="+encodeURIComponent(buildWA()),"_blank");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#25D366", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"20px", fontWeight:700 }}>W</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>WhatsApp</span>
          </button>
          <button onClick={function(){doCopy(buildIG());alert("Caption IG di-copy! ✅\nBuka IG → Paste.");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"linear-gradient(135deg, #833AB4, #E1306C, #F77737)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"18px", fontWeight:700 }}>IG</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>Instagram</span>
          </button>
          <button onClick={function(){window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://"+tokoLink),"_blank");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#1877F2", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"18px", fontWeight:700 }}>f</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>Facebook</span>
          </button>
          <button onClick={function(){window.open("https://t.me/share/url?url="+encodeURIComponent("https://"+tokoLink)+"&text="+encodeURIComponent(buildPlain()),"_blank");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#0088cc", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"18px", fontWeight:700 }}>T</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>Telegram</span>
          </button>
          <button onClick={function(){window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent("\uD83D\uDD25 "+nama+"\n\uD83D\uDCB0 "+harga+"\n\n\uD83D\uDED2 "+tokoLink+"\n\n#UMKM #Loman"),"_blank");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#1DA1F2", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"18px", fontWeight:700 }}>X</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>Twitter</span>
          </button>
          <button onClick={function(){doCopy(buildPlain());alert("Teks di-copy! ✅\nBuka WA → Status → Paste.");}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"#f59e0b", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"16px", fontWeight:700 }}>📸</span>
            </div>
            <span style={{ fontSize:"10px", color:"#374151", fontWeight:500 }}>WA Story</span>
          </button>
          <button onClick={function(){doCopy(buildPlain());setCopied(true);setTimeout(function(){setCopied(false);},2000);}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background: copied ? "#d1fae5" : "#f9fafb", cursor:"pointer" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background: copied ? "#10b981" : "#6b7280", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontSize:"16px" }}>{copied ? "✓" : "🔗"}</span>
            </div>
            <span style={{ fontSize:"10px", color: copied ? "#059669" : "#374151", fontWeight:500 }}>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
`);

console.log("");
console.log("🎉 Selesai! Emoji & ikon medsos sudah diperbaiki.");
console.log("   npm run dev");
console.log("   git add . && git commit -m 'fix emoji share' && git push");
