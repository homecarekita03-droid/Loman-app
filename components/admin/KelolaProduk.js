"use client";
import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function KelolaProduk({ tokoId, tokoNama, products, setProducts }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ nama: "", harga: "", deskripsi: "" });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const tokoProducts = products.filter(function(p) { return p.tokoId === tokoId; });

  function handleFoto(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg("Foto max 5MB"); return; }
    setFotoFile(file);
    var reader = new FileReader();
    reader.onloadend = function() { setFotoPreview(reader.result); };
    reader.readAsDataURL(file);
  }

  async function tambahProduk() {
    if (!form.nama.trim()) { setMsg("Isi nama produk dulu"); return; }
    if (!form.harga || parseInt(form.harga) <= 0) { setMsg("Isi harga dulu"); return; }

    setSaving(true);
    setMsg("Menyimpan...");

    try {
      // Buat data produk
      var data = {
        tokoId: tokoId,
        nama: form.nama.trim(),
        harga: parseInt(form.harga),
        deskripsi: (form.deskripsi || "").trim(),
        emoji: "🍚",
        kategori: "makanan",
        tersedia: true,
        createdAt: new Date().toISOString(),
      };

      // Coba upload foto (opsional - jika gagal, tetap simpan tanpa foto)
      if (fotoFile) {
        try {
          var fileName = Date.now() + "_" + fotoFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
          var storageRef = ref(storage, "produk/" + fileName);
          await uploadBytes(storageRef, fotoFile);
          data.foto = await getDownloadURL(storageRef);
          setMsg("Foto berhasil diupload, menyimpan...");
        } catch (fotoErr) {
          console.error("Upload foto gagal:", fotoErr);
          // Tetap simpan produk tanpa foto
          setMsg("Foto gagal diupload, simpan tanpa foto...");
        }
      }

      // Simpan ke Firestore (selalu jalan, walau foto gagal)
      var newDoc = await addDoc(collection(db, "produk"), data);

      // Update state lokal
      setProducts(function(prev) { return prev.concat([{ id: newDoc.id, ...data }]); });

      // Reset form
      setForm({ nama: "", harga: "", deskripsi: "" });
      setFotoFile(null);
      setFotoPreview(null);

      if (data.foto) {
        setMsg("✅ \"" + data.nama + "\" ditambahkan dengan foto!");
      } else {
        setMsg("✅ \"" + data.nama + "\" ditambahkan (tanpa foto)");
      }

      setTimeout(function() { setMsg(""); }, 3000);

    } catch (err) {
      console.error("Error tambah produk:", err);
      setMsg("❌ Gagal: " + err.message);
    }

    setSaving(false);
  }

  async function toggleProduk(p) {
    try {
      var newState = (p.tersedia === false) ? true : false;
      await updateDoc(doc(db, "produk", p.id), { tersedia: newState });
      setProducts(function(prev) {
        return prev.map(function(x) { return x.id === p.id ? Object.assign({}, x, { tersedia: newState }) : x; });
      });
    } catch (err) { console.error("Error toggle:", err); }
  }

  async function hapusProduk(p) {
    if (!confirm("Hapus \"" + p.nama + "\"?")) return;
    try {
      await deleteDoc(doc(db, "produk", p.id));
      setProducts(function(prev) { return prev.filter(function(x) { return x.id !== p.id; }); });
    } catch (err) { console.error("Error hapus:", err); }
  }

  var inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0", fontSize: "13px", outline: "none",
  };

  return (
    <div style={{ marginTop: "12px", padding: "12px", borderRadius: "10px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#a78bfa" }}>📦 {tokoNama} ({tokoProducts.length} produk)</h4>
        <button onClick={function() { setShowForm(!showForm); setMsg(""); }} style={{ padding: "6px 12px", borderRadius: "8px", background: showForm ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: "none", color: showForm ? "#f87171" : "#34d399", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
          {showForm ? "✕ Tutup" : "➕ Tambah"}
        </button>
      </div>

      {/* Daftar produk */}
      {tokoProducts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: showForm ? "12px" : "0" }}>
          {tokoProducts.map(function(p) {
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", opacity: p.tersedia !== false ? 1 : 0.5 }}>
                {p.foto ? <img src={p.foto} alt="" style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} /> : <span style={{ fontSize: "20px" }}>{p.emoji || "📦"}</span>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", fontWeight: 600 }}>{p.nama}</p>
                  <p style={{ fontSize: "11px", color: "#f59e0b" }}>Rp {(p.harga || 0).toLocaleString("id")}</p>
                </div>
                <button onClick={function() { toggleProduk(p); }} style={{ padding: "3px 8px", borderRadius: "4px", background: p.tersedia !== false ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)", border: "none", color: p.tersedia !== false ? "#34d399" : "#f87171", fontSize: "9px", fontWeight: 600, cursor: "pointer" }}>{p.tersedia !== false ? "ON" : "OFF"}</button>
                <button onClick={function() { hapusProduk(p); }} style={{ padding: "3px 8px", borderRadius: "4px", background: "rgba(239,68,68,0.2)", border: "none", color: "#f87171", fontSize: "9px", fontWeight: 600, cursor: "pointer" }}>🗑️</button>
              </div>
            );
          })}
        </div>
      )}

      {tokoProducts.length === 0 && !showForm && <p style={{ fontSize: "12px", color: "#64748b" }}>Belum ada produk</p>}

      {/* Form tambah */}
      {showForm && (
        <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "10px" }}>
            {fotoPreview ? <img src={fotoPreview} alt="" style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }} /> : <div style={{ width: "50px", height: "50px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📷</div>}
            <span style={{ fontSize: "11px", color: "#64748b" }}>Foto (opsional)</span>
            <input type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
          </label>
          <div style={{ marginBottom: "8px" }}><input type="text" value={form.nama} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { nama: e.target.value }); }); }} placeholder="Nama produk *" style={inputStyle} /></div>
          <div style={{ marginBottom: "8px" }}><input type="number" value={form.harga} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { harga: e.target.value }); }); }} placeholder="Harga (Rp) *" style={inputStyle} /></div>
          <div style={{ marginBottom: "10px" }}><input type="text" value={form.deskripsi} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { deskripsi: e.target.value }); }); }} placeholder="Deskripsi (opsional)" style={inputStyle} /></div>

          {msg && <p style={{ fontSize: "11px", padding: "6px 10px", borderRadius: "6px", marginBottom: "8px", background: msg.indexOf("✅") >= 0 ? "rgba(16,185,129,0.1)" : msg.indexOf("❌") >= 0 ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)", color: msg.indexOf("✅") >= 0 ? "#34d399" : msg.indexOf("❌") >= 0 ? "#f87171" : "#60a5fa" }}>{msg}</p>}

          <button onClick={tambahProduk} disabled={saving} style={{ width: "100%", padding: "10px", borderRadius: "8px", background: saving ? "#475569" : "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", fontWeight: 700, fontSize: "13px", cursor: saving ? "default" : "pointer" }}>
            {saving ? "⏳ Menyimpan..." : "➕ Tambah Produk"}
          </button>
        </div>
      )}
    </div>
  );
}
