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
    lines.push("\ud83c\udfea *" + tokoNama + "*");
    lines.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    lines.push("");
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      lines.push((i + 1) + ". *" + p.nama + "*  \u2014  Rp " + (p.harga || 0).toLocaleString("id"));
    }
    lines.push("");
    lines.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    lines.push("\u2705 Pesan langsung, antar ke rumah");
    lines.push("\u2705 Bayar di tempat (COD)");
    lines.push("");
    lines.push("\ud83d\uded2 *PESAN SEKARANG* \ud83d\udc47");
    lines.push(tokoLink);
    lines.push("");
    lines.push("_Loman \u2014 Belanja Setetangga \ud83c\udfe8_");
    return lines.join("\n");
  }

  function buildPlain() {
    var lines = [];
    lines.push("\ud83c\udfea " + tokoNama);
    lines.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    lines.push("");
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      lines.push((i + 1) + ". " + p.nama + " - Rp " + (p.harga || 0).toLocaleString("id"));
    }
    lines.push("");
    lines.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    lines.push("\u2705 Pesan langsung, antar ke rumah");
    lines.push("");
    lines.push("\ud83d\udc49 PESAN: " + tokoLink);
    lines.push("");
    lines.push("Loman - Belanja Setetangga");
    return lines.join("\n");
  }

  function doCopy(text) {
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

  function shareWA() {
    window.open("https://wa.me/?text=" + encodeURIComponent(buildWA()), "_blank");
  }

  function shareIG() {
    doCopy(buildPlain() + "\n\n#UMKM #Loman #BelanjaSetetangga");
    alert("Caption IG di-copy! \u2705\nBuka Instagram > Paste.");
  }

  function shareFB() {
    window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("https://" + tokoLink), "_blank");
  }

  function shareTG() {
    window.open("https://t.me/share/url?url=" + encodeURIComponent("https://" + tokoLink) + "&text=" + encodeURIComponent(buildPlain()), "_blank");
  }

  function copyAll() {
    doCopy(buildPlain());
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  }

  function nativeShare() {
    if (navigator.share) {
      navigator.share({ title: tokoNama, text: buildPlain(), url: "https://" + tokoLink });
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"white", width:"100%", maxWidth:"480px", borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"85vh", overflowY:"auto", animation:"slideUp 0.3s ease" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:800 }}>\ud83d\udce4 Share Semua Produk</h3>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"16px" }}>\u2715</button>
        </div>

        <div style={{ background:"#1f2937", borderRadius:"14px", padding:"16px", marginBottom:"16px", maxHeight:"220px", overflowY:"auto" }}>
          <p style={{ fontSize:"11px", color:"#64748b", marginBottom:"8px" }}>Preview:</p>
          <p style={{ fontSize:"14px", fontWeight:700, color:"#fbbf24", marginBottom:"8px" }}>\ud83c\udfea {tokoNama}</p>
          {products.map(function(p, i) {
            return <p key={i} style={{ fontSize:"13px", color:"#e2e8f0", marginBottom:"3px" }}>
              <span style={{ color:"#9ca3af" }}>{i + 1}.</span> {p.nama} <span style={{ color:"#fbbf24" }}>Rp {(p.harga || 0).toLocaleString("id")}</span>
            </p>;
          })}
          <div style={{ borderTop:"1px solid #374151", marginTop:"10px", paddingTop:"10px" }}>
            <p style={{ fontSize:"12px", color:"#34d399" }}>\u2705 Pesan langsung, antar ke rumah</p>
            <p style={{ fontSize:"13px", color:"#fbbf24", fontWeight:700, marginTop:"4px" }}>\ud83d\uded2 PESAN: {tokoLink}</p>
          </div>
        </div>

        <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"14px", textAlign:"center" }}>{products.length} produk akan dibagikan</p>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{ width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px", background:"linear-gradient(135deg, #f59e0b, #ea580c)", color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer" }}>\ud83d\udce4 Bagikan Sekarang</button>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"6px" }}>
          <button onClick={shareWA} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udcac</span><span style={{ fontSize:"9px", color:"#6b7280" }}>WhatsApp</span></button>
          <button onClick={shareIG} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udcf7</span><span style={{ fontSize:"9px", color:"#6b7280" }}>Instagram</span></button>
          <button onClick={shareFB} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udcd8</span><span style={{ fontSize:"9px", color:"#6b7280" }}>Facebook</span></button>
          <button onClick={shareTG} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\u2708\ufe0f</span><span style={{ fontSize:"9px", color:"#6b7280" }}>Telegram</span></button>
          <button onClick={copyAll} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"12px 4px", borderRadius:"14px", border:"none", background: copied ? "#d1fae5" : "#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udd17</span><span style={{ fontSize:"9px", color: copied ? "#059669" : "#6b7280" }}>{copied ? "Copied!" : "Copy"}</span></button>
        </div>
      </div>
    </div>
  );
}
