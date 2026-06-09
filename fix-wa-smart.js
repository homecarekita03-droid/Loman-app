// ============================================
// 📲 Smart WA — Pengingat Singkat, Arahkan ke Loman
// ============================================
// Jalankan: node fix-wa-smart.js
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
console.log("📲 Smart WA Notification...");
console.log("");

// =============================================
// 1. UPDATE waNotif.js — Pesan singkat, arahkan ke Loman
// =============================================
writeFile("lib/waNotif.js", `
// ============================================
// 📲 Smart WA Notification
// Pesan SINGKAT — tanpa detail pesanan
// User HARUS buka Loman untuk lihat detail
// ============================================

var domain = "loman.store";

// Ke PENJUAL: ada pesanan baru
export function notifPesananBaru(sellerPhone, pembeliNama) {
  if (!sellerPhone) return null;
  var phone = formatPhone(sellerPhone);
  var text = "🔔 *Ada pesanan baru di LOMAN!*\\n\\n";
  text += "Dari: " + (pembeliNama || "Pembeli") + "\\n\\n";
  text += "👉 Buka sekarang untuk lihat & terima pesanan:\\n";
  text += domain + "\\n\\n";
  text += "_Loman — Belanja Setetangga_";
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

// Ke PEMBELI: pesanan diterima
export function notifPesananDiterima(buyerPhone, tokoNama) {
  if (!buyerPhone) return null;
  var phone = formatPhone(buyerPhone);
  var text = "✅ *Pesanan Anda diterima!*\\n\\n";
  text += "🏪 " + (tokoNama || "Toko") + " sudah menerima pesanan Anda.\\n\\n";
  text += "👉 Pantau status pesanan di:\\n";
  text += domain + "\\n\\n";
  text += "_Loman — Belanja Setetangga_";
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

// Ke PEMBELI: pesanan dikirim
export function notifPesananDikirim(buyerPhone, tokoNama) {
  if (!buyerPhone) return null;
  var phone = formatPhone(buyerPhone);
  var text = "🛵 *Pesanan Anda sedang diantar!*\\n\\n";
  text += "🏪 " + (tokoNama || "Toko") + "\\n";
  text += "Siap-siap ya, pesanan segera sampai!\\n\\n";
  text += "👉 " + domain + "\\n\\n";
  text += "_Loman — Belanja Setetangga_";
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

// Ke PEMBELI: pesanan selesai
export function notifPesananSelesai(buyerPhone, tokoNama) {
  if (!buyerPhone) return null;
  var phone = formatPhone(buyerPhone);
  var text = "🎉 *Pesanan selesai!*\\n\\n";
  text += "Terima kasih sudah pesan di " + (tokoNama || "Toko") + "!\\n\\n";
  text += "👉 Pesan lagi di:\\n";
  text += domain + "\\n\\n";
  text += "_Loman — Belanja Setetangga_";
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

function formatPhone(phone) {
  var p = phone.replace(/[^0-9]/g, "");
  if (p.startsWith("08")) p = "628" + p.substring(2);
  if (p.startsWith("8")) p = "62" + p;
  if (!p.startsWith("62")) p = "62" + p;
  return p;
}
`);

// =============================================
// 2. UPDATE KERANJANG — Sesuaikan parameter
// =============================================
var keranjangPath = "app/buyer/keranjang/page.js";
if (fs.existsSync(keranjangPath)) {
  var c = fs.readFileSync(keranjangPath, "utf-8");

  // Cek apakah sudah ada waNotif dari script sebelumnya
  if (c.includes("notifPesananBaru")) {
    // Ganti cara panggil notifPesananBaru — hanya kirim nama, bukan detail
    c = c.replace(
      /var waUrl = notifPesananBaru\(sellerPhone, \{[^}]+\}\);/g,
      'var waUrl = notifPesananBaru(sellerPhone, userData?.nama || "Pembeli");'
    );
    fs.writeFileSync(keranjangPath, c);
    console.log("  ✅ " + keranjangPath + " (smart WA)");
  } else {
    console.log("  ℹ️ " + keranjangPath + " (waNotif belum ada, tambahkan dulu)");

    // Tambah import
    c = c.replace(
      'import BottomNav from "@/components/BottomNav";',
      'import BottomNav from "@/components/BottomNav";\nimport { notifPesananBaru } from "@/lib/waNotif";'
    );

    // Cek apakah ada import getDoc
    if (!c.includes("getDoc")) {
      c = c.replace(
        'import { collection, addDoc } from "firebase/firestore";',
        'import { collection, addDoc, doc, getDoc } from "firebase/firestore";'
      );
    }

    // Tambah WA notif setelah checkout sukses
    c = c.replace(
      'setCart([]); localStorage.removeItem("loman_cart"); setSuccess(true);',
      `setCart([]); localStorage.removeItem("loman_cart"); setSuccess(true);
      // Smart WA: kirim pengingat singkat ke penjual
      try {
        for (var gKey of Object.keys(groups)) {
          var g = groups[gKey];
          var tokoDoc = await getDoc(doc(db, "toko", g.tokoId));
          if (tokoDoc.exists()) {
            var tokoData = tokoDoc.data();
            var sellerPhone = tokoData.whatsapp || "";
            if (sellerPhone) {
              var waUrl = notifPesananBaru(sellerPhone, userData?.nama || "Pembeli");
              if (waUrl) window.open(waUrl, "_blank");
            }
          }
        }
      } catch(we) { console.log("WA notif:", we); }`
    );

    fs.writeFileSync(keranjangPath, c);
    console.log("  ✅ " + keranjangPath + " (smart WA added)");
  }
}

// =============================================
// 3. UPDATE SELLER DASHBOARD — Sesuaikan parameter
// =============================================
var sellerPath = "app/seller/page.js";
if (fs.existsSync(sellerPath)) {
  var c = fs.readFileSync(sellerPath, "utf-8");

  if (c.includes("notifPesananDiterima")) {
    // Sudah ada, update parameter
    c = c.replace(
      /notifPesananDiterima\(order\.pembeliPhone, order, tName\)/g,
      'notifPesananDiterima(order.pembeliPhone, tName)'
    );
    c = c.replace(
      /notifPesananDikirim\(order\.pembeliPhone, order, tName\)/g,
      'notifPesananDikirim(order.pembeliPhone, tName)'
    );
    c = c.replace(
      /notifPesananSelesai\(order\.pembeliPhone, order, tName\)/g,
      'notifPesananSelesai(order.pembeliPhone, tName)'
    );
    fs.writeFileSync(sellerPath, c);
    console.log("  ✅ " + sellerPath + " (smart WA params updated)");
  } else {
    // Tambah baru
    c = c.replace(
      'import BottomNav from "@/components/BottomNav";',
      'import BottomNav from "@/components/BottomNav";\nimport { notifPesananDiterima, notifPesananDikirim, notifPesananSelesai } from "@/lib/waNotif";'
    );

    // Ganti updateStatus
    var oldUpdate = 'async function updateStatus(id,s) { await updateDoc(doc(db,"pesanan",id),{status:s}); setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o)); }';
    if (c.includes(oldUpdate)) {
      c = c.replace(oldUpdate, `async function updateStatus(id, s) {
    await updateDoc(doc(db,"pesanan",id), {status:s});
    setOrders(function(p) { return p.map(function(o) { return o.id===id ? {...o, status:s} : o; }); });
    var order = orders.find(function(o) { return o.id === id; });
    if (order && order.pembeliPhone) {
      var tName = store ? store.nama : "Toko";
      var waUrl = null;
      if (s === "confirmed") waUrl = notifPesananDiterima(order.pembeliPhone, tName);
      if (s === "delivering") waUrl = notifPesananDikirim(order.pembeliPhone, tName);
      if (s === "done") waUrl = notifPesananSelesai(order.pembeliPhone, tName);
      if (waUrl) window.open(waUrl, "_blank");
    }
  }`);
    }

    fs.writeFileSync(sellerPath, c);
    console.log("  ✅ " + sellerPath + " (smart WA added)");
  }
}

console.log("");
console.log("🎉 ========================================");
console.log("   SMART WA NOTIFICATION SELESAI!");
console.log("========================================");
console.log("");
console.log("   PERBEDAAN DENGAN SEBELUMNYA:");
console.log("");
console.log("   ❌ Sebelum: Kirim DETAIL pesanan ke WA");
console.log("      → Penjual & pembeli bisa transaksi di WA");
console.log("      → Loman di-bypass");
console.log("");
console.log("   ✅ Sekarang: Kirim PENGINGAT SINGKAT saja");
console.log("      → 'Ada pesanan baru! Buka loman.store'");
console.log("      → TANPA detail item/harga");
console.log("      → User HARUS buka Loman untuk lihat & proses");
console.log("      → Semua transaksi tetap lewat Loman!");
console.log("");
console.log("   npm run dev");
console.log("   git add . && git commit -m 'smart wa notif' && git push");
console.log("");
