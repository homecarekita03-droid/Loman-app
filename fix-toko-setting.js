// ============================================
// 🔧 Fix Toko Setting (tulis ulang bersih)
// ============================================
// Jalankan: node fix-toko-setting.js
// ============================================

const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trimStart());
  console.log("  ✅ " + filePath);
}

console.log("🔧 Fixing toko-setting...");

writeFile("app/seller/toko-setting/page.js", `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BottomNav from "@/components/BottomNav";
import LocationPicker from "@/components/LocationPicker";

const tokoEmojis = ["🏪","🍳","🧁","🥤","👕","🧴","🍕","🍔","☕","🌮","🍜","🥘","🍱","🧆","🛒","🎂"];

const SEMUA_KATEGORI = [
  { id:"makanan", emoji:"🍚", label:"Makanan" },
  { id:"minuman", emoji:"🥤", label:"Minuman" },
  { id:"kue", emoji:"🧁", label:"Kue & Snack" },
  { id:"kebutuhan_pokok", emoji:"🛒", label:"Kebutuhan Pokok" },
  { id:"kelontong", emoji:"🏪", label:"Kelontong" },
  { id:"laundry", emoji:"👕", label:"Laundry" },
  { id:"jasa_elektronik", emoji:"🔧", label:"Jasa Elektronik" },
  { id:"jasa_bangunan", emoji:"🏗️", label:"Jasa Bangunan" },
  { id:"jasa_otomotif", emoji:"🔩", label:"Jasa Otomotif" },
  { id:"jasa_kebersihan", emoji:"🧹", label:"Jasa Kebersihan" },
  { id:"jasa_jahit", emoji:"🧵", label:"Jasa Jahit" },
  { id:"jasa_kecantikan", emoji:"💇", label:"Kecantikan" },
  { id:"jasa_kesehatan", emoji:"💊", label:"Kesehatan" },
  { id:"jasa_pendidikan", emoji:"📚", label:"Les & Kursus" },
  { id:"fashion", emoji:"👗", label:"Fashion" },
  { id:"tanaman", emoji:"🌿", label:"Tanaman" },
  { id:"frozen_food", emoji:"🧊", label:"Frozen Food" },
  { id:"catering", emoji:"🍱", label:"Catering" },
  { id:"lainnya", emoji:"📦", label:"Lainnya" },
];

function compressImage(file, maxWidth, quality) {
  return new Promise(function(resolve) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.onload = function() {
      var w = img.width;
      var h = img.height;
      if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(function(blob) { resolve(blob); }, "image/jpeg", quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function TokoSetting() {
  var router = useRouter();
  var auth = useAuth();
  var user = auth.user;
  var al = auth.loading;
  var [store, setStore] = useState(null);
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [saved, setSaved] = useState(false);
  var [showLoc, setShowLoc] = useState(false);
  var [bannerFile, setBannerFile] = useState(null);
  var [bannerPreview, setBannerPreview] = useState(null);
  var [uploadMsg, setUploadMsg] = useState("");
  var [form, setForm] = useState({
    nama: "", deskripsi: "", emoji: "🏪",
    jamBuka: "08:00", jamTutup: "20:00", whatsapp: "",
    kategori: "", kategoriList: [],
    alamatDetail: "", rt: "", rw: "",
    kelurahan: "", kecamatan: "", kota: "",
  });

  useEffect(function() { if (!al && !user) router.push("/login"); }, [user, al, router]);

  useEffect(function() {
    async function f() {
      if (!user) return;
      try {
        var sq = await getDocs(query(collection(db, "toko"), where("pemilikId", "==", user.uid)));
        if (!sq.empty) {
          var s = { id: sq.docs[0].id, ...sq.docs[0].data() };
          setStore(s);
          setForm({
            nama: s.nama || "", deskripsi: s.deskripsi || "", emoji: s.emoji || "🏪",
            jamBuka: s.jamBuka || "08:00", jamTutup: s.jamTutup || "20:00",
            whatsapp: s.whatsapp || "",
            kategori: s.kategori || "",
            kategoriList: s.kategoriList || (s.kategori ? [s.kategori] : []),
            alamatDetail: s.alamatDetail || s.alamat || "",
            rt: s.rt || "", rw: s.rw || "",
            kelurahan: s.kelurahan || "", kecamatan: s.kecamatan || "", kota: s.kota || "",
          });
          if (s.banner) setBannerPreview(s.banner);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    f();
  }, [user]);

  function toggleKategori(id) {
    setForm(function(f) {
      var list = f.kategoriList.includes(id)
        ? f.kategoriList.filter(function(k) { return k !== id; })
        : f.kategoriList.concat([id]);
      return { ...f, kategoriList: list, kategori: list[0] || "" };
    });
  }

  function handleBannerSelect(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Maksimal 5MB"); return; }
    compressImage(file, 1200, 0.7).then(function(blob) {
      var compressed = new File([blob], file.name, { type: "image/jpeg" });
      setBannerFile(compressed);
      var reader = new FileReader();
      reader.onloadend = function() { setBannerPreview(reader.result); };
      reader.readAsDataURL(compressed);
    });
  }

  async function removeBanner() {
    if (!store || !confirm("Hapus banner?")) return;
    await updateDoc(doc(db, "toko", store.id), { banner: "" });
    setStore(function(p) { return { ...p, banner: "" }; });
    setBannerPreview(null);
    setBannerFile(null);
  }

  async function saveLocation(pos) {
    if (!store) return;
    await updateDoc(doc(db, "toko", store.id), { lat: pos.lat, lng: pos.lng });
    setStore(function(p) { return { ...p, lat: pos.lat, lng: pos.lng }; });
  }

  async function save() {
    if (!store) return;
    setSaving(true);
    setUploadMsg("");

    var alamatParts = [];
    if (form.alamatDetail) alamatParts.push(form.alamatDetail);
    if (form.rt) alamatParts.push("RT " + form.rt);
    if (form.rw) alamatParts.push("RW " + form.rw);
    if (form.kelurahan) alamatParts.push(form.kelurahan);
    if (form.kecamatan) alamatParts.push(form.kecamatan);
    if (form.kota) alamatParts.push(form.kota);

    var updates = {
      nama: form.nama, deskripsi: form.deskripsi, emoji: form.emoji,
      jamBuka: form.jamBuka, jamTutup: form.jamTutup, whatsapp: form.whatsapp,
      kategori: form.kategoriList[0] || form.kategori || "",
      kategoriList: form.kategoriList,
      alamat: alamatParts.join(", "),
      alamatDetail: form.alamatDetail, rt: form.rt, rw: form.rw,
      kelurahan: form.kelurahan, kecamatan: form.kecamatan, kota: form.kota,
    };

    if (bannerFile) {
      setUploadMsg("Mengupload banner...");
      try {
        var fn = Date.now() + "_banner.jpg";
        var r = ref(storage, "toko-banners/" + fn);
        await uploadBytes(r, bannerFile);
        var url = await getDownloadURL(r);
        updates.banner = url;
        setBannerFile(null);
      } catch (e) { console.error("Upload error:", e); }
    }

    try {
      setUploadMsg("Menyimpan...");
      await updateDoc(doc(db, "toko", store.id), updates);
      setStore(function(p) { return { ...p, ...updates }; });
      setSaved(true);
      setUploadMsg("");
      setTimeout(function() { setSaved(false); }, 2000);
    } catch (e) { alert("Gagal menyimpan."); setUploadMsg(""); }
    setSaving(false);
  }

  var inputStyle = { width: "100%", padding: "14px 16px", border: "2px solid #e5e7eb", borderRadius: "14px", fontSize: "14px", outline: "none", background: "#f9fafb" };
  var inputSmall = { width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "14px", outline: "none", background: "#f9fafb" };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: "48px" }}>🏪</div></div>;

  var alamatPreview = [];
  if (form.alamatDetail) alamatPreview.push(form.alamatDetail);
  if (form.rt || form.rw) alamatPreview.push((form.rt ? "RT " + form.rt : "") + (form.rw ? " / RW " + form.rw : ""));
  if (form.kelurahan) alamatPreview.push(form.kelurahan);
  if (form.kecamatan) alamatPreview.push("Kec. " + form.kecamatan);
  if (form.kota) alamatPreview.push(form.kota);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", paddingBottom: "100px" }}>
      <div style={{ background: "white", padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "12px", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={function() { router.push("/seller"); }} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <h1 style={{ fontSize: "18px", fontWeight: 900 }}>⚙️ Pengaturan Toko</h1>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>Preview:</p>
        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ height: "120px", background: bannerPreview ? "url(" + bannerPreview + ") center/cover" : "linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!bannerPreview && <span style={{ fontSize: "40px", opacity: 0.5 }}>{form.emoji}</span>}
          </div>
          <div style={{ padding: "12px 14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800 }}>{form.nama || "Nama Toko"}</h3>
            {form.kategoriList.length > 0 && (
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                {form.kategoriList.map(function(k) { var cat = SEMUA_KATEGORI.find(function(c) { return c.id === k; }); return cat ? <span key={k} style={{ padding: "2px 8px", borderRadius: "10px", background: "#fef3c7", color: "#d97706", fontSize: "10px", fontWeight: 600 }}>{cat.emoji} {cat.label}</span> : null; })}
              </div>
            )}
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "6px" }}>📍 {alamatPreview.join(", ") || "-"} • 🕐 {form.jamBuka}-{form.jamTutup}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "12px" }}>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px", display: "block" }}>🖼️ Banner Toko</label>
          {bannerPreview ? (
            <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
              <img src={bannerPreview} alt="" style={{ width: "100%", height: "100px", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: "6px", right: "6px", display: "flex", gap: "4px" }}>
                <label style={{ padding: "5px 10px", borderRadius: "16px", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>📷 Ganti<input type="file" accept="image/*" onChange={handleBannerSelect} style={{ display: "none" }} /></label>
                <button onClick={removeBanner} style={{ padding: "5px 10px", borderRadius: "16px", background: "rgba(239,68,68,0.8)", color: "white", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "none" }}>🗑️</button>
              </div>
            </div>
          ) : (
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", cursor: "pointer", border: "2px dashed #d1d5db", borderRadius: "12px", background: "#f9fafb" }}>
              <span style={{ fontSize: "28px", marginBottom: "6px" }}>🖼️</span>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>Upload banner (maks 5MB)</span>
              <input type="file" accept="image/*" onChange={handleBannerSelect} style={{ display: "none" }} />
            </label>
          )}
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px", display: "block" }}>🎨 Ikon Toko</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "6px" }}>
            {tokoEmojis.map(function(e) { return <button key={e} onClick={function() { setForm(function(f) { return { ...f, emoji: e }; }); }} style={{ width: "100%", aspectRatio: "1", borderRadius: "10px", border: "none", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: form.emoji === e ? "#fef3c7" : "#f9fafb", boxShadow: form.emoji === e ? "0 0 0 2px #f59e0b" : "none" }}>{e}</button>; })}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "6px", display: "block" }}>🏪 Nama Toko</label>
          <input value={form.nama} onChange={function(e) { setForm(function(f) { return { ...f, nama: e.target.value }; }); }} placeholder="Dapur Bu Sari" style={inputStyle} />
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "4px", display: "block" }}>📂 Kategori Toko</label>
          <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px" }}>Pilih satu atau lebih</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {SEMUA_KATEGORI.map(function(k) {
              var selected = form.kategoriList.includes(k.id);
              return <button key={k.id} onClick={function() { toggleKategori(k.id); }} style={{ padding: "10px 8px", borderRadius: "10px", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", background: selected ? "linear-gradient(135deg, #fef3c7, #fde68a)" : "#f9fafb", color: selected ? "#d97706" : "#6b7280", boxShadow: selected ? "0 0 0 2px #f59e0b" : "none" }}><span style={{ fontSize: "16px" }}>{k.emoji}</span><span style={{ flex: 1 }}>{k.label}</span>{selected && <span>✓</span>}</button>;
            })}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "6px", display: "block" }}>📝 Deskripsi</label>
          <textarea value={form.deskripsi} onChange={function(e) { setForm(function(f) { return { ...f, deskripsi: e.target.value }; }); }} placeholder="Jelaskan toko Anda..." rows={3} style={{ ...inputStyle, resize: "none" }} />
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px", display: "block" }}>📍 Alamat</label>
          <input value={form.alamatDetail} onChange={function(e) { setForm(function(f) { return { ...f, alamatDetail: e.target.value }; }); }} placeholder="Jl./Blok/No" style={{ ...inputSmall, marginBottom: "8px" }} />
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: "11px", color: "#9ca3af" }}>RT</label><input value={form.rt} onChange={function(e) { setForm(function(f) { return { ...f, rt: e.target.value }; }); }} placeholder="001" style={inputSmall} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: "11px", color: "#9ca3af" }}>RW</label><input value={form.rw} onChange={function(e) { setForm(function(f) { return { ...f, rw: e.target.value }; }); }} placeholder="005" style={inputSmall} /></div>
          </div>
          <input value={form.kelurahan} onChange={function(e) { setForm(function(f) { return { ...f, kelurahan: e.target.value }; }); }} placeholder="Kelurahan / Desa" style={{ ...inputSmall, marginBottom: "8px" }} />
          <input value={form.kecamatan} onChange={function(e) { setForm(function(f) { return { ...f, kecamatan: e.target.value }; }); }} placeholder="Kecamatan" style={{ ...inputSmall, marginBottom: "8px" }} />
          <input value={form.kota} onChange={function(e) { setForm(function(f) { return { ...f, kota: e.target.value }; }); }} placeholder="Kota / Kabupaten" style={inputSmall} />
          {alamatPreview.length > 0 && <div style={{ marginTop: "8px", padding: "8px 10px", background: "#f0fdf4", borderRadius: "8px" }}><p style={{ fontSize: "11px", color: "#059669" }}>📍 {alamatPreview.join(", ")}</p></div>}
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "6px", display: "block" }}>🗺️ Lokasi GPS</label>
          {store && store.lat ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>✅ Sudah diatur</p>
              <button onClick={function() { setShowLoc(true); }} style={{ padding: "8px 16px", borderRadius: "10px", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Ubah</button>
            </div>
          ) : (
            <button onClick={function() { setShowLoc(true); }} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "#dbeafe", border: "2px dashed #93c5fd", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#2563eb" }}>📍 Atur Lokasi</button>
          )}
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "6px", display: "block" }}>🕐 Jam Buka</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input type="time" value={form.jamBuka} onChange={function(e) { setForm(function(f) { return { ...f, jamBuka: e.target.value }; }); }} style={{ ...inputSmall, flex: 1 }} />
            <span style={{ color: "#9ca3af" }}>—</span>
            <input type="time" value={form.jamTutup} onChange={function(e) { setForm(function(f) { return { ...f, jamTutup: e.target.value }; }); }} style={{ ...inputSmall, flex: 1 }} />
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "14px", padding: "14px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "6px", display: "block" }}>💬 No. WhatsApp</label>
          <input value={form.whatsapp} onChange={function(e) { setForm(function(f) { return { ...f, whatsapp: e.target.value }; }); }} placeholder="08xxxxxxxxxx" style={inputSmall} />
        </div>

        {uploadMsg && <p style={{ textAlign: "center", fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>{uploadMsg}</p>}

        <button onClick={save} disabled={saving} style={{
          width: "100%", padding: "16px", borderRadius: "14px", border: "none",
          background: saved ? "#10b981" : saving ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
          color: "white", fontWeight: 800, fontSize: "16px",
          cursor: saving ? "default" : "pointer", marginTop: "4px",
        }}>{saved ? "✅ Tersimpan!" : saving ? "Menyimpan..." : "💾 Simpan Pengaturan"}</button>
      </div>

      {showLoc && <LocationPicker initialLat={store ? store.lat : null} initialLng={store ? store.lng : null} onSelect={function(pos) { saveLocation(pos); }} onClose={function() { setShowLoc(false); }} />}
      <BottomNav role="seller" active="profile" />
    </div>
  );
}
`);

console.log("");
console.log("🎉 File toko-setting.js ditulis ulang bersih!");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Jika OK: git add . && git commit -m 'fix toko setting' && git push");
console.log("");
