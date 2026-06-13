"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc, addDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import KelolaProduk from "@/components/admin/KelolaProduk";

// ⚠️ GANTI DENGAN EMAIL GOOGLE ANDA (yang login sebagai admin)
const ADMIN_EMAILS = ["homecarekita03@gmail.com"]; // Tambahkan email admin di sini

// ===== KOMPONEN DIBANTU UPLOAD =====
function DibantuUploadTab({ stores, setStores, products, setProducts }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [storeId, setStoreId] = useState(null);
  const [sellerForm, setSellerForm] = useState({ nama: "", phone: "", perumahan: "", alamat: "", kategori: "makanan" });
  const [produkForm, setProdukForm] = useState({ nama: "", harga: "", deskripsi: "", emoji: "🍚", kategori: "makanan" });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [produkList, setProdukList] = useState([]);

  const emojiList = ["🍚","🍜","🍗","🥘","🧁","🍰","🥤","☕","🧃","👕","🧴","📦","🥬","🍳","🥗","🍲","🍕","🍔","🌮","🥪","🍱"];
  const kategoriList = [
    { value: "makanan", label: "🍚 Makanan" }, { value: "minuman", label: "🥤 Minuman" },
    { value: "kue", label: "🧁 Kue & Snack" }, { value: "kebutuhan_pokok", label: "🛒 Sembako" },
    { value: "kelontong", label: "🏪 Kelontong" }, { value: "frozen_food", label: "🧊 Frozen Food" },
    { value: "laundry", label: "👕 Laundry" }, { value: "fashion", label: "👗 Fashion" },
    { value: "sayuran", label: "🥬 Sayuran" }, { value: "catering", label: "🍱 Catering" },
    { value: "lainnya", label: "📦 Lainnya" },
  ];

  async function buatSeller() {
    if (!sellerForm.nama || !sellerForm.phone) { setMsg("❌ Nama dan No. WA wajib diisi!"); return; }
    setSaving(true); setMsg("");
    try {
      const tokoRef = doc(collection(db, "toko"));
      const tokoData = {
        nama: sellerForm.nama, pemilikId: "admin-" + tokoRef.id, kategori: sellerForm.kategori,
        deskripsi: "", alamat: sellerForm.alamat, perumahan: sellerForm.perumahan,
        whatsapp: sellerForm.phone, jamBuka: "08:00", jamTutup: "20:00", emoji: "🏪",
        rating: 0, isOpen: true, createdAt: new Date().toISOString(),
        dibantuUpload: true, sellerName: sellerForm.nama, sellerPhone: sellerForm.phone,
      };
      await setDoc(tokoRef, tokoData);
      setStoreId(tokoRef.id);
      setStores(prev => [...prev, { id: tokoRef.id, ...tokoData }]);
      setMsg("✅ Toko berhasil dibuat! Sekarang tambahkan produk.");
      setStep(2);
    } catch (e) { setMsg("❌ Gagal: " + e.message); }
    setSaving(false);
  }

  function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg("❌ Foto max 5MB"); return; }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function tambahProduk() {
    if (!produkForm.nama || !produkForm.harga) { setMsg("❌ Nama dan harga wajib!"); return; }
    setSaving(true); setMsg("");
    try {
      let fotoUrl = null;
      if (fotoFile) {
        const fn = Date.now() + "_" + fotoFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const storageRef = ref(storage, "produk/" + fn);
        await uploadBytes(storageRef, fotoFile);
        fotoUrl = await getDownloadURL(storageRef);
      }
      const produkData = {
        tokoId: storeId, nama: produkForm.nama.trim(), harga: parseInt(produkForm.harga),
        deskripsi: produkForm.deskripsi.trim(), emoji: produkForm.emoji,
        kategori: produkForm.kategori, tersedia: true, createdAt: new Date().toISOString(),
      };
      if (fotoUrl) produkData.foto = fotoUrl;
      const newDoc = await addDoc(collection(db, "produk"), produkData);
      setProdukList(prev => [...prev, { id: newDoc.id, ...produkData }]);
      setProducts(prev => [...prev, { id: newDoc.id, ...produkData }]);
      setProdukForm({ nama: "", harga: "", deskripsi: "", emoji: "🍚", kategori: "makanan" });
      setFotoFile(null); setFotoPreview(null);
      setMsg("✅ \"" + produkForm.nama + "\" ditambahkan!");
    } catch (e) { setMsg("❌ Gagal: " + e.message); }
    setSaving(false);
  }

  function selesai() {
    setStep(1); setStoreId(null);
    setSellerForm({ nama: "", phone: "", perumahan: "", alamat: "", kategori: "makanan" });
    setProdukList([]); setMsg("✅ Selesai! Toko & produk sudah tayang.");
  }

  const inputStyle = { width: "100%", padding: "12px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "14px", outline: "none", background: "rgba(255,255,255,0.05)", color: "#e2e8f0" };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <div style={{ flex: 1, padding: "10px", borderRadius: "10px", background: step >= 1 ? "#f59e0b" : "rgba(255,255,255,0.04)", color: step >= 1 ? "#1f2937" : "#64748b", textAlign: "center", fontSize: "13px", fontWeight: 700 }}>1️⃣ Info Mitra</div>
        <div style={{ flex: 1, padding: "10px", borderRadius: "10px", background: step >= 2 ? "#f59e0b" : "rgba(255,255,255,0.04)", color: step >= 2 ? "#1f2937" : "#64748b", textAlign: "center", fontSize: "13px", fontWeight: 700 }}>2️⃣ Tambah Produk</div>
      </div>
      {msg && <div style={{ padding: "12px", borderRadius: "10px", marginBottom: "16px", background: msg.includes("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: "1px solid " + (msg.includes("✅") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)") }}><p style={{ fontSize: "13px", color: msg.includes("✅") ? "#34d399" : "#f87171" }}>{msg}</p></div>}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700 }}>📝 Data Mitra & Toko</h3>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>Nama Toko *</label><input value={sellerForm.nama} onChange={e => setSellerForm(f => ({ ...f, nama: e.target.value }))} placeholder="Dapur Bu Sari" style={inputStyle} /></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>No. WhatsApp *</label><input value={sellerForm.phone} onChange={e => setSellerForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xxx" style={inputStyle} /></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>Perumahan</label><input value={sellerForm.perumahan} onChange={e => setSellerForm(f => ({ ...f, perumahan: e.target.value }))} placeholder="Griya Indah" style={inputStyle} /></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>Alamat (Blok/No)</label><input value={sellerForm.alamat} onChange={e => setSellerForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Blok A5 No. 12" style={inputStyle} /></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>Kategori</label><select value={sellerForm.kategori} onChange={e => setSellerForm(f => ({ ...f, kategori: e.target.value }))} style={inputStyle}>{kategoriList.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}</select></div>
          <button onClick={buatSeller} disabled={saving} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: saving ? "#475569" : "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", border: "none", fontWeight: 700, fontSize: "15px", cursor: saving ? "default" : "pointer", marginTop: "8px" }}>{saving ? "⏳ Mendaftarkan..." : "🤝 Daftarkan Mitra"}</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ fontSize: "16px", fontWeight: 700 }}>📦 Tambah Produk</h3><span style={{ fontSize: "12px", color: "#94a3b8" }}>{produkList.length} produk</span></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>📸 Foto</label><label style={{ display: "block", padding: "20px", borderRadius: "12px", border: "2px dashed rgba(255,255,255,0.1)", textAlign: "center", cursor: "pointer" }}>{fotoPreview ? <img src={fotoPreview} alt="" style={{ width: "100px", height: "100px", borderRadius: "10px", objectFit: "cover" }} /> : <div><div style={{ fontSize: "32px" }}>📷</div><p style={{ fontSize: "12px", color: "#64748b" }}>Tap untuk foto</p></div>}<input type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} /></label></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>🎨 Emoji</label><div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>{emojiList.map(e => <button key={e} onClick={() => setProdukForm(f => ({ ...f, emoji: e }))} style={{ width: "36px", height: "36px", borderRadius: "8px", border: "none", fontSize: "18px", cursor: "pointer", background: produkForm.emoji === e ? "#f59e0b" : "rgba(255,255,255,0.05)" }}>{e}</button>)}</div></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>Nama Produk *</label><input value={produkForm.nama} onChange={e => setProdukForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nasi Goreng" style={inputStyle} /></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>Harga (Rp) *</label><input type="number" value={produkForm.harga} onChange={e => setProdukForm(f => ({ ...f, harga: e.target.value }))} placeholder="15000" style={inputStyle} /></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>Kategori</label><select value={produkForm.kategori} onChange={e => setProdukForm(f => ({ ...f, kategori: e.target.value }))} style={inputStyle}>{kategoriList.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}</select></div>
          <div><label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", display: "block" }}>Deskripsi</label><textarea value={produkForm.deskripsi} onChange={e => setProdukForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Bahan, porsi..." rows={2} style={{ ...inputStyle, resize: "none" }} /></div>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button onClick={tambahProduk} disabled={saving} style={{ flex: 1, padding: "14px", borderRadius: "12px", background: saving ? "#475569" : "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", fontWeight: 700, fontSize: "14px", cursor: saving ? "default" : "pointer" }}>{saving ? "⏳ Upload..." : "➕ Tambah"}</button>
            <button onClick={selesai} style={{ padding: "14px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>✅ Selesai</button>
          </div>
          {produkList.length > 0 && <div style={{ marginTop: "12px" }}><h4 style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px" }}>Produk ditambahkan:</h4><div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{produkList.map(p => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}><span style={{ fontSize: "13px" }}>{p.emoji} {p.nama}</span><span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>Rp {p.harga.toLocaleString("id")}</span></div>)}</div></div>}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: al } = useAuth();
  const [stats, setStats] = useState({ users: 0, sellers: 0, buyers: 0, stores: 0, products: 0, orders: 0, revenue: 0, ordersToday: 0, revenueToday: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProdForm, setEditProdForm] = useState({});
  const [editFotoFile, setEditFotoFile] = useState(null);
  const [editFotoPreview, setEditFotoPreview] = useState(null);
  const [managingStore, setManagingStore] = useState(null);
  const [newProduk, setNewProduk] = useState({ nama: "", harga: "", deskripsi: "", emoji: "🍚", kategori: "makanan" });
  const [newFotoFile, setNewFotoFile] = useState(null);
  const [newFotoPreview, setNewFotoPreview] = useState(null);

  useEffect(() => {
    if (!al && !user) { router.push("/login"); return; }
    if (user && !ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    if (user) setIsAdmin(true);
  }, [user, al, router]);

  useEffect(() => {
    async function fetchAll() {
      if (!user || !isAdmin) return;
      try {
        const [usersSnap, storesSnap, productsSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "toko")),
          getDocs(collection(db, "produk")),
          getDocs(collection(db, "pesanan")),
        ]);

        const userList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const storeList = storesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const productList = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const orderList = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setUsers(userList);
        setStores(storeList);
        setProducts(productList);
        setOrders(orderList);

        const today = new Date().toDateString();
        const todayOrders = orderList.filter(o => new Date(o.createdAt).toDateString() === today);
        const completedOrders = orderList.filter(o => o.status === "done");

        setStats({
          users: userList.length,
          sellers: userList.filter(u => u.role === "seller").length,
          buyers: userList.filter(u => u.role === "buyer").length,
          stores: storeList.length,
          products: productList.length,
          orders: orderList.length,
          revenue: completedOrders.reduce((s, o) => s + (o.totalHarga || 0), 0),
          ordersToday: todayOrders.length,
          revenueToday: todayOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.totalHarga || 0), 0),
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchAll();
  }, [user, isAdmin]);

  function formatRp(n) {
    if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(1) + "Jt";
    if (n >= 1000) return "Rp " + Math.round(n / 1000) + "K";
    return "Rp " + n;
  }

  function timeAgo(iso) {
    if (!iso) return "-";
    const m = Math.floor((new Date() - new Date(iso)) / 60000);
    if (m < 1) return "Baru";
    if (m < 60) return m + "m lalu";
    if (m < 1440) return Math.floor(m / 60) + "j lalu";
    return Math.floor(m / 1440) + "h lalu";
  }

  const statusColors = {
    pending: { bg: "#fef3c7", c: "#d97706", l: "⏳ Pending" },
    confirmed: { bg: "#dbeafe", c: "#2563eb", l: "✅ Diterima" },
    processing: { bg: "#e0e7ff", c: "#7c3aed", l: "🔄 Diproses" },
    delivering: { bg: "#fae8ff", c: "#a855f7", l: "🛵 Diantar" },
    done: { bg: "#d1fae5", c: "#059669", l: "✅ Selesai" },
    cancelled: { bg: "#fee2e2", c: "#dc2626", l: "❌ Batal" },
  };

  // ===== STORE MANAGEMENT =====
  async function toggleStore(s) {
    const newState = !s.isOpen;
    await updateDoc(doc(db, "toko", s.id), { isOpen: newState });
    setStores(prev => prev.map(x => x.id === s.id ? { ...x, isOpen: newState } : x));
  }

  function startEdit(s) {
    setEditingStore(s.id);
    setEditForm({ nama: s.nama || "", alamat: s.alamat || "", kategori: s.kategori || "makanan", whatsapp: s.whatsapp || "", deskripsi: s.deskripsi || "" });
  }

  async function saveEdit() {
    if (!editingStore) return;
    await updateDoc(doc(db, "toko", editingStore), editForm);
    setStores(prev => prev.map(x => x.id === editingStore ? { ...x, ...editForm } : x));
    setEditingStore(null);
  }

  async function deleteStore(s) {
    if (!confirm("Hapus toko \"" + s.nama + "\"?\n\nSemua produk di toko ini juga akan dihapus.")) return;
    // Hapus semua produk toko ini
    const storeProducts = products.filter(p => p.tokoId === s.id);
    for (const p of storeProducts) {
      await deleteDoc(doc(db, "produk", p.id));
    }
    // Hapus toko
    await deleteDoc(doc(db, "toko", s.id));
    setStores(prev => prev.filter(x => x.id !== s.id));
    setProducts(prev => prev.filter(x => x.tokoId !== s.id));
  }

  async function deleteProduct(p) {
    if (!confirm("Hapus produk \"" + p.nama + "\"?")) return;
    await deleteDoc(doc(db, "produk", p.id));
    setProducts(prev => prev.filter(x => x.id !== p.id));
  }

  // ===== PRODUCT MANAGEMENT =====
  async function toggleProduct(p) {
    const newState = p.tersedia === false ? true : false;
    await updateDoc(doc(db, "produk", p.id), { tersedia: newState });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, tersedia: newState } : x));
  }

  function startEditProduct(p) {
    setEditingProduct(p.id);
    setEditProdForm({
      nama: p.nama || "", harga: String(p.harga || ""),
      deskripsi: p.deskripsi || "", emoji: p.emoji || "🍚",
      kategori: p.kategori || "makanan", foto: p.foto || "",
    });
    setEditFotoFile(null);
    setEditFotoPreview(p.foto || null);
  }

  function handleEditFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    setEditFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setEditFotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function saveEditProduct() {
    if (!editingProduct) return;
    const updates = {
      nama: editProdForm.nama, harga: parseInt(editProdForm.harga) || 0,
      deskripsi: editProdForm.deskripsi, emoji: editProdForm.emoji,
      kategori: editProdForm.kategori,
    };
    try {
      if (editFotoFile) {
        const fn = Date.now() + "_" + editFotoFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const storageRef = ref(storage, "produk/" + fn);
        await uploadBytes(storageRef, editFotoFile);
        updates.foto = await getDownloadURL(storageRef);
      }
      await updateDoc(doc(db, "produk", editingProduct), updates);
      setProducts(prev => prev.map(x => x.id === editingProduct ? { ...x, ...updates } : x));
      setEditingProduct(null);
    } catch (e) { alert("Gagal: " + e.message); }
  }

  // ===== KELOLA PRODUK PER TOKO =====
  function handleNewFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    setNewFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNewFotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function tambahProdukKeToko(tokoId) {
    if (!newProduk.nama || !newProduk.harga) {
      alert("Nama produk dan harga wajib diisi!");
      return;
    }
    try {
      let fotoUrl = null;
      if (newFotoFile) {
        var fn = Date.now() + "_" + newFotoFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
        var sr = ref(storage, "produk/" + fn);
        await uploadBytes(sr, newFotoFile);
        fotoUrl = await getDownloadURL(sr);
      }
      var d = {
        tokoId: tokoId,
        nama: newProduk.nama.trim(),
        harga: parseInt(newProduk.harga),
        deskripsi: (newProduk.deskripsi || "").trim(),
        emoji: newProduk.emoji || "🍚",
        kategori: newProduk.kategori || "makanan",
        tersedia: true,
        createdAt: new Date().toISOString(),
      };
      if (fotoUrl) d.foto = fotoUrl;
      var newDoc = await addDoc(collection(db, "produk"), d);
      setProducts(function(prev) { return prev.concat([{ id: newDoc.id, ...d }]); });
      setNewProduk({ nama: "", harga: "", deskripsi: "", emoji: "🍚", kategori: "makanan" });
      setNewFotoFile(null);
      setNewFotoPreview(null);
      alert("✅ Produk \"" + d.nama + "\" berhasil ditambahkan!");
    } catch (e) {
      console.error("Tambah produk error:", e);
      alert("❌ Gagal: " + e.message);
    }
  }

  async function toggleProdukToko(p) {
    const newState = p.tersedia === false ? true : false;
    await updateDoc(doc(db, "produk", p.id), { tersedia: newState });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, tersedia: newState } : x));
  }

  async function hapusProdukToko(p) {
    if (!confirm("Hapus \"" + p.nama + "\"?")) return;
    await deleteDoc(doc(db, "produk", p.id));
    setProducts(prev => prev.filter(x => x.id !== p.id));
  }

  if (al || loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}><div style={{ textAlign: "center", color: "white" }}><div style={{ fontSize: "48px", marginBottom: "8px" }}>👑</div><p>Memuat Admin Dashboard...</p></div></div>;

  if (!isAdmin) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "white", padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔒</div>
      <h1 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>Akses Ditolak</h1>
      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>Halaman ini hanya untuk admin Loman.</p>
      <button onClick={() => router.push("/")} style={{ padding: "12px 32px", borderRadius: "12px", background: "#f59e0b", color: "#1f2937", border: "none", fontWeight: 700, cursor: "pointer" }}>Kembali ke Beranda</button>
    </div>
  );

  const tabs = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "dibantu", icon: "🤝", label: "Daftarkan Mitra" },
    { id: "users", icon: "👥", label: "Users (" + stats.users + ")" },
    { id: "stores", icon: "🏪", label: "Toko (" + stats.stores + ")" },
    { id: "orders", icon: "📦", label: "Pesanan (" + stats.orders + ")" },
    { id: "products", icon: "📋", label: "Produk (" + stats.products + ")" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>👑</span>
              <h1 style={{ fontSize: "20px", fontWeight: 900 }}>Admin Dashboard</h1>
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Loman — Local Market Nusantara</p>
          </div>
          <button onClick={() => router.push("/")} style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>← App</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "12px 16px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="no-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "8px 14px", borderRadius: "10px", border: "none",
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
            background: activeTab === t.id ? "#f59e0b" : "rgba(255,255,255,0.04)",
            color: activeTab === t.id ? "#1f2937" : "#94a3b8",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { icon: "👥", label: "Total User", value: stats.users, sub: stats.sellers + " penjual, " + stats.buyers + " pembeli", color: "#3b82f6" },
                { icon: "🏪", label: "Total Toko", value: stats.stores, sub: "aktif di platform", color: "#10b981" },
                { icon: "📦", label: "Total Pesanan", value: stats.orders, sub: stats.ordersToday + " hari ini", color: "#f59e0b" },
                { icon: "💰", label: "Total Pendapatan", value: formatRp(stats.revenue), sub: formatRp(stats.revenueToday) + " hari ini", color: "#ef4444" },
                { icon: "📋", label: "Total Produk", value: stats.products, sub: "terdaftar", color: "#8b5cf6" },
                { icon: "📊", label: "Rata-rata/Pesanan", value: stats.orders > 0 ? formatRp(Math.round(stats.revenue / Math.max(1, orders.filter(o => o.status === "done").length))) : "Rp 0", sub: "nilai pesanan", color: "#ec4899" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: "14px", padding: "14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.icon}</div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
                  <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>📦 Pesanan Terbaru</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {orders.slice(0, 8).map(o => {
                const st = statusColors[o.status] || statusColors.pending;
                return (
                  <div key={o.id} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>#{o.id.slice(-6).toUpperCase()}</span>
                        <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: st.bg, color: st.c }}>{st.l}</span>
                      </div>
                      <p style={{ fontSize: "13px", fontWeight: 600 }}>👤 {o.pembeliNama} → 🏪 {o.tokoNama}</p>
                      <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{o.items?.map(i => i.nama + " x" + i.qty).join(", ")}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#f59e0b" }}>Rp {(o.totalHarga || 0).toLocaleString("id")}</p>
                      <p style={{ fontSize: "10px", color: "#64748b" }}>{timeAgo(o.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status Distribution */}
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginTop: "20px", marginBottom: "10px" }}>📊 Distribusi Status Pesanan</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {Object.entries(statusColors).map(([key, val]) => {
                const count = orders.filter(o => o.status === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "18px", fontWeight: 900, color: val.c }}>{count}</span>
                    <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>{val.l}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== DIBANTU UPLOAD TAB ===== */}
        {activeTab === "dibantu" && <DibantuUploadTab stores={stores} setStores={setStores} products={products} setProducts={setProducts} db={db} />}

        {/* ===== USERS TAB ===== */}
        {activeTab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", fontSize: "12px", color: "#60a5fa" }}>👥 Total: {stats.users}</div>
              <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", fontSize: "12px", color: "#fbbf24" }}>🏪 Penjual: {stats.sellers}</div>
              <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", fontSize: "12px", color: "#34d399" }}>🛒 Pembeli: {stats.buyers}</div>
            </div>
            {users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(u => (
              <div key={u.id} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: u.role === "seller" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  {u.role === "seller" ? "🏪" : u.role === "buyer" ? "🛒" : "👤"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600 }}>{u.nama || "No Name"}</h4>
                  <p style={{ fontSize: "11px", color: "#64748b" }}>{u.email}</p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px", fontSize: "11px", color: "#475569" }}>
                    {u.phone && <span>📱 {u.phone}</span>}
                    {u.perumahan && <span>📍 {u.perumahan}</span>}
                    {u.alamat && <span>🏠 {u.alamat}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: "10px", fontSize: "10px", fontWeight: 600,
                    background: u.role === "seller" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
                    color: u.role === "seller" ? "#fbbf24" : "#60a5fa",
                  }}>{u.role || "No Role"}</span>
                  <p style={{ fontSize: "10px", color: "#475569", marginTop: "4px" }}>{timeAgo(u.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== STORES TAB ===== */}
        {activeTab === "stores" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {stores.map(s => {
              const storeOrders = orders.filter(o => o.tokoId === s.id);
              const storeProducts = products.filter(p => p.tokoId === s.id);
              const storeRevenue = storeOrders.filter(o => o.status === "done").reduce((sum, o) => sum + (o.totalHarga || 0), 0);
              const isEditing = editingStore === s.id;
              return (
                <div key={s.id} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: "14px", padding: "14px",
                  border: isEditing ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.06)",
                }}>
                  {isEditing ? (
                    /* MODE EDIT */
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#f59e0b" }}>✏️ Edit Toko</h4>
                      <input value={editForm.nama} onChange={e => setEditForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama Toko" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: "13px" }} />
                      <input value={editForm.whatsapp} onChange={e => setEditForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="No. WhatsApp" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: "13px" }} />
                      <input value={editForm.alamat} onChange={e => setEditForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Alamat" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: "13px" }} />
                      <textarea value={editForm.deskripsi} onChange={e => setEditForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Deskripsi" rows={2} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: "13px", resize: "none" }} />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={saveEdit} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#10b981", color: "white", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>💾 Simpan</button>
                        <button onClick={() => setEditingStore(null)} style={{ padding: "10px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>Batal</button>
                      </div>
                    </div>
                  ) : (
                    /* MODE LIHAT */
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{s.emoji || "🏪"}</div>
                          <div>
                            <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{s.nama}</h4>
                            <p style={{ fontSize: "11px", color: "#64748b" }}>{s.alamat || "-"} • {s.kategori || "-"}</p>
                            {s.whatsapp && <p style={{ fontSize: "11px", color: "#64748b" }}>📱 {s.whatsapp}</p>}
                          </div>
                        </div>
                        <span style={{
                          padding: "4px 10px", borderRadius: "10px", fontSize: "10px", fontWeight: 600,
                          background: s.isOpen ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                          color: s.isOpen ? "#34d399" : "#f87171",
                        }}>{s.isOpen ? "● Buka" : "● Tutup"}</span>
                      </div>

                      {/* Stats */}
                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#f59e0b" }}>{storeProducts.length}</div>
                          <div style={{ fontSize: "9px", color: "#64748b" }}>Produk</div>
                        </div>
                        <div style={{ padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#3b82f6" }}>{storeOrders.length}</div>
                          <div style={{ fontSize: "9px", color: "#64748b" }}>Pesanan</div>
                        </div>
                        <div style={{ padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#10b981" }}>{formatRp(storeRevenue)}</div>
                          <div style={{ fontSize: "9px", color: "#64748b" }}>Revenue</div>
                        </div>
                      </div>

                      {/* Tombol Aksi */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button onClick={() => toggleStore(s)} style={{ padding: "7px 12px", borderRadius: "8px", background: s.isOpen ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border: "none", color: s.isOpen ? "#f87171" : "#34d399", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                          {s.isOpen ? "🔴 Tutup" : "🟢 Buka"}
                        </button>
                        <button onClick={() => setManagingStore(managingStore === s.id ? null : s.id)} style={{ padding: "7px 12px", borderRadius: "8px", background: "rgba(139,92,246,0.15)", border: "none", color: "#a78bfa", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                          📦 Produk ({storeProducts.length})
                        </button>
                        <button onClick={() => startEdit(s)} style={{ padding: "7px 12px", borderRadius: "8px", background: "rgba(59,130,246,0.15)", border: "none", color: "#60a5fa", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => deleteStore(s)} style={{ padding: "7px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.15)", border: "none", color: "#f87171", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                          🗑️ Hapus
                        </button>
                      </div>

                      {/* KELOLA PRODUK (expand) */}
                      {managingStore === s.id && (
                        <KelolaProduk
                          tokoId={s.id}
                          tokoNama={s.nama}
                          products={products}
                          setProducts={setProducts}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
            {stores.length === 0 && <div style={{ textAlign: "center", padding: "40px" }}><div style={{ fontSize: "40px", marginBottom: "8px" }}>🏪</div><p style={{ color: "#64748b" }}>Belum ada toko</p></div>}
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {orders.slice(0, 30).map(o => {
              const st = statusColors[o.status] || statusColors.pending;
              return (
                <div key={o.id} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>#{o.id.slice(-8).toUpperCase()}</span>
                    <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: st.bg, color: st.c }}>{st.l}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px" }}>👤 {o.pembeliNama}</span>
                    <span style={{ fontSize: "13px" }}>🏪 {o.tokoNama}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#64748b" }}>{o.items?.map(i => i.nama + " x" + i.qty).join(", ")}</p>
                  {o.catatan && <p style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>📝 {o.catatan}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontWeight: 700, color: "#f59e0b" }}>Rp {(o.totalHarga || 0).toLocaleString("id")}</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{new Date(o.createdAt).toLocaleDateString("id", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === "products" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {products.map(p => {
              const store = stores.find(s => s.id === p.tokoId);
              const isEditing = editingProduct === p.id;
              if (isEditing) {
                const eInput = { width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: "12px" };
                return (
                  <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px", border: "1px solid #f59e0b" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b", marginBottom: "10px" }}>✏️ Edit Produk</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Foto */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <label style={{ cursor: "pointer" }}>
                          {editFotoPreview ? <img src={editFotoPreview} alt="" style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }} /> : <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📷</div>}
                          <input type="file" accept="image/*" onChange={handleEditFoto} style={{ display: "none" }} />
                        </label>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Tap foto untuk ganti</span>
                      </div>
                      <input value={editProdForm.nama} onChange={e => setEditProdForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama" style={eInput} />
                      <input type="number" value={editProdForm.harga} onChange={e => setEditProdForm(f => ({ ...f, harga: e.target.value }))} placeholder="Harga" style={eInput} />
                      <textarea value={editProdForm.deskripsi} onChange={e => setEditProdForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Deskripsi" rows={2} style={{ ...eInput, resize: "none" }} />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={saveEditProduct} style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "#10b981", color: "white", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>💾 Simpan</button>
                        <button onClick={() => setEditingProduct(null)} style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>Batal</button>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={p.id} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", gap: "12px", alignItems: "center",
                  opacity: p.tersedia !== false ? 1 : 0.5,
                }}>
                  {p.foto ? (
                    <img src={p.foto} alt="" style={{ width: "50px", height: "50px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "50px", height: "50px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{p.emoji || "📦"}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600 }}>{p.nama}</h4>
                    <p style={{ fontSize: "12px", color: "#64748b" }}>🏪 {store?.nama || "?"} • {p.kategori || "-"}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#f59e0b" }}>Rp {(p.harga || 0).toLocaleString("id")}</p>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => toggleProduct(p)} style={{ padding: "4px 8px", borderRadius: "6px", background: p.tersedia !== false ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: "none", color: p.tersedia !== false ? "#34d399" : "#f87171", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>
                        {p.tersedia !== false ? "✅ On" : "❌ Off"}
                      </button>
                      <button onClick={() => startEditProduct(p)} style={{ padding: "4px 8px", borderRadius: "6px", background: "rgba(59,130,246,0.15)", border: "none", color: "#60a5fa", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>✏️</button>
                      <button onClick={() => deleteProduct(p)} style={{ padding: "4px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#f87171", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && <div style={{ textAlign: "center", padding: "40px" }}><div style={{ fontSize: "40px", marginBottom: "8px" }}>📦</div><p style={{ color: "#64748b" }}>Belum ada produk</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
