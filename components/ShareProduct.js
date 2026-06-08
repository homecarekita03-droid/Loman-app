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
  var harga = "Rp " + (product.harga || 0).toLocaleString("id");
  var desk = product.deskripsi || "";

  function buildWA() {
    var lines = [];
    lines.push("\ud83d\udd25 *" + nama + "* \ud83d\udd25");
    lines.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    lines.push("\ud83d\udcb0 *" + harga + "*");
    if (desk) { lines.push(""); lines.push("\ud83d\udcdd " + desk); }
    lines.push("");
    lines.push("\ud83c\udfea _" + tokoNama + "_");
    lines.push("");
    lines.push("\u2705 Pesan langsung, antar ke rumah!");
    lines.push("\u2705 Bayar di tempat (COD)");
    lines.push("");
    lines.push("\ud83d\udc49 *PESAN SEKARANG:*");
    lines.push(tokoLink);
    lines.push("");
    lines.push("_Loman \u2014 Belanja Setetangga \ud83c\udfe8_");
    return lines.join("\n");
  }

  function buildPlain() {
    var lines = [];
    lines.push("\ud83d\udd25 " + nama + " \ud83d\udd25");
    lines.push("\ud83d\udcb0 " + harga);
    if (desk) lines.push("\ud83d\udcdd " + desk);
    lines.push("\ud83c\udfea " + tokoNama);
    lines.push("");
    lines.push("\u2705 Pesan langsung, antar ke rumah!");
    lines.push("\ud83d\udc49 PESAN: " + tokoLink);
    lines.push("");
    lines.push("Loman - Belanja Setetangga");
    return lines.join("\n");
  }

  function buildIG() {
    var lines = [];
    lines.push(nama + " \ud83d\udd25");
    lines.push("\ud83d\udcb0 " + harga);
    lines.push("");
    if (desk) { lines.push(desk); lines.push(""); }
    lines.push("\ud83d\uded2 Pesan di " + tokoLink);
    lines.push("\ud83c\udfea " + tokoNama);
    lines.push("");
    lines.push("#JualanOnline #UMKM #Loman #BelanjaSetetangga #MakananRumahan");
    return lines.join("\n");
  }

  function doCopy(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text); }
    else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
  }

  function shareWA() { window.open("https://wa.me/?text=" + encodeURIComponent(buildWA()), "_blank"); }
  function shareWAStory() { doCopy(buildPlain()); alert("Teks di-copy! \u2705\nBuka WA > Status > Paste."); }
  function shareIG() { doCopy(buildIG()); alert("Caption IG di-copy! \u2705\nBuka IG > Buat Post > Paste."); }
  function shareFB() { window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("https://" + tokoLink) + "&quote=" + encodeURIComponent(buildPlain()), "_blank"); }
  function shareTG() { window.open("https://t.me/share/url?url=" + encodeURIComponent("https://" + tokoLink) + "&text=" + encodeURIComponent(buildPlain()), "_blank"); }
  function shareTW() { window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent("\ud83d\udd25 " + nama + "\n\ud83d\udcb0 " + harga + "\n\n\ud83d\uded2 " + tokoLink + "\n\n#UMKM #Loman"), "_blank"); }
  function copyLink() { doCopy(buildPlain()); setCopied(true); setTimeout(function() { setCopied(false); }, 2000); }

  function nativeShare() {
    if (navigator.share) { navigator.share({ title: nama, text: buildPlain(), url: "https://" + tokoLink }); }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"white", width:"100%", maxWidth:"480px", borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"90vh", overflowY:"auto", animation:"slideUp 0.3s ease" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:800 }}>\ud83d\udce4 Bagikan Produk</h3>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#f3f4f6", border:"none", cursor:"pointer", fontSize:"16px" }}>\u2715</button>
        </div>

        <div style={{ background:"#f9fafb", borderRadius:"14px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
            {product.foto
              ? <img src={product.foto} alt="" style={{ width:"56px", height:"56px", borderRadius:"12px", objectFit:"cover" }} />
              : <div style={{ width:"56px", height:"56px", borderRadius:"12px", background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>{product.emoji || "\ud83d\udce6"}</div>
            }
            <div>
              <h4 style={{ fontSize:"15px", fontWeight:700 }}>{nama}</h4>
              <p style={{ fontSize:"16px", fontWeight:800, color:"#f59e0b" }}>{harga}</p>
            </div>
          </div>
          <div style={{ marginTop:"12px", padding:"10px 12px", background:"white", borderRadius:"10px", border:"1px solid #e5e7eb" }}>
            <p style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"6px" }}>Preview:</p>
            <div style={{ fontSize:"12px", color:"#374151", lineHeight:1.7 }}>
              <p>\ud83d\udd25 {nama} \ud83d\udd25</p>
              <p>\ud83d\udcb0 {harga}</p>
              <p>\ud83c\udfea {tokoNama}</p>
              <p style={{ marginTop:"6px" }}>\u2705 Pesan langsung, antar ke rumah!</p>
              <p style={{ fontWeight:700, color:"#f59e0b" }}>\ud83d\udc49 PESAN: {tokoLink}</p>
            </div>
          </div>
        </div>

        {typeof navigator !== "undefined" && navigator.share && (
          <button onClick={nativeShare} style={{ width:"100%", padding:"14px", borderRadius:"14px", marginBottom:"12px", background:"linear-gradient(135deg, #f59e0b, #ea580c)", color:"white", border:"none", fontWeight:700, fontSize:"15px", cursor:"pointer" }}>\ud83d\udce4 Bagikan Sekarang</button>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"8px" }}>
          <button onClick={shareWA} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udcac</span><span style={{ fontSize:"10px", color:"#6b7280" }}>WhatsApp</span></button>
          <button onClick={shareWAStory} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udcf8</span><span style={{ fontSize:"10px", color:"#6b7280" }}>WA Story</span></button>
          <button onClick={shareIG} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udcf7</span><span style={{ fontSize:"10px", color:"#6b7280" }}>Instagram</span></button>
          <button onClick={shareFB} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udcd8</span><span style={{ fontSize:"10px", color:"#6b7280" }}>Facebook</span></button>
          <button onClick={shareTG} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\u2708\ufe0f</span><span style={{ fontSize:"10px", color:"#6b7280" }}>Telegram</span></button>
          <button onClick={shareTW} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background:"#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udc26</span><span style={{ fontSize:"10px", color:"#6b7280" }}>Twitter</span></button>
          <button onClick={copyLink} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", padding:"14px 4px", borderRadius:"14px", border:"none", background: copied ? "#d1fae5" : "#f9fafb", cursor:"pointer" }}><span style={{ fontSize:"24px" }}>\ud83d\udd17</span><span style={{ fontSize:"10px", color: copied ? "#059669" : "#6b7280" }}>{copied ? "Copied!" : "Copy"}</span></button>
        </div>
      </div>
    </div>
  );
}
