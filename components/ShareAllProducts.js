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
      return (i + 1) + ". " + p.nama + "  \u2014  Rp " + (p.harga || 0).toLocaleString("id");
    }).join("\n");
  }

  var waMsg = [
    "\ud83c\udfea *" + toko + "*",
    "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501",
    "",
    buildList(),
    "",
    "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501",
    "\u2705 Pesan langsung, antar ke rumah",
    "\u2705 Bayar di tempat (COD)",
    "",
    "\ud83d\uded2 *PESAN SEKARANG* \ud83d\udc47",
    domain,
    "",
    "_Loman \u2014 Belanja Setetangga \ud83c\udfe8_",
  ].join("\n");

  var plainMsg = waMsg.replace(/\*/g, "").replace(/_/g, "");

  function doCopy(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text); }
    else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); }
  }

  var buttons = [
    { name:"WhatsApp", icon:"\ud83d\udcac", fn: function() { window.open("https://wa.me/?text=" + encodeURIComponent(waMsg), "_blank"); } },
    { name:"Instagram", icon:"\ud83d\udcf7", fn: function() { doCopy(plainMsg + "\n\n#UMKM #Loman #BelanjaSetetangga"); alert("Caption IG di-copy! \u2705"); } },
    { name:"Facebook", icon:"\ud83d\udcd8", fn: function() { window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(tokoUrl), "_blank"); } },
    { name:"Telegram", icon:"\u2708\ufe0f", fn: function() { window.open("https://t.me/share/url?url=" + encodeURIComponent(tokoUrl) + "&text=" + encodeURIComponent(plainMsg), "_blank"); } },
    { name:"Copy", icon:"\ud83d\udd17", fn: function() { doCopy(plainMsg); setCopied(true); setTimeout(function(){ setCopied(false); }, 2000); } },
  ];

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
          <p style={{ fontSize:"14px", fontWeight:700, color:"#fbbf24", marginBottom:"8px" }}>\ud83c\udfea {toko}</p>
          {products.map(function(p, i) {
            return <p key={p.id || i} style={{ fontSize:"13px", color:"#e2e8f0", marginBottom:"3px" }}>
              <span style={{ color:"#9ca3af" }}>{i + 1}.</span> {p.nama} <span style={{ color:"#fbbf24" }}>Rp {(p.harga || 0).toLocaleString("id")}</span>
            </p>;
          })}
          <div style={{ borderTop:"1px solid #374151", marginTop:"10px", paddingTop:"10px" }}>
            <p style={{ fontSize:"12px", color:"#34d399" }}>\u2705 Pesan langsung, antar ke rumah</p>
            <p style={{ fontSize:"13px", color:"#fbbf24", fontWeight:700, marginTop:"4px" }}>\ud83d\uded2 PESAN: {domain}</p>
          </div>
        </div>

        <p style={{ fontSize:"12px", color:"#6b7280", marginBottom:"14px", textAlign:"center" }}>{products.length} produk</p>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={function() { navigator.share({ title:toko, text:plainMsg, url:tokoUrl }); }} style={{
            width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px",
            background:"linear-gradient(135deg, #f59e0b, #ea580c)",
            color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer",
          }}>\ud83d\udce4 Bagikan Sekarang</button>
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
