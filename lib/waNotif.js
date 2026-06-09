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
  var text = "🔔 *Ada pesanan baru di LOMAN!*\n\n";
  text += "Dari: " + (pembeliNama || "Pembeli") + "\n\n";
  text += "👉 Buka sekarang untuk lihat & terima pesanan:\n";
  text += domain + "\n\n";
  text += "_Loman — Belanja Setetangga_";
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

// Ke PEMBELI: pesanan diterima
export function notifPesananDiterima(buyerPhone, tokoNama) {
  if (!buyerPhone) return null;
  var phone = formatPhone(buyerPhone);
  var text = "✅ *Pesanan Anda diterima!*\n\n";
  text += "🏪 " + (tokoNama || "Toko") + " sudah menerima pesanan Anda.\n\n";
  text += "👉 Pantau status pesanan di:\n";
  text += domain + "\n\n";
  text += "_Loman — Belanja Setetangga_";
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

// Ke PEMBELI: pesanan dikirim
export function notifPesananDikirim(buyerPhone, tokoNama) {
  if (!buyerPhone) return null;
  var phone = formatPhone(buyerPhone);
  var text = "🛵 *Pesanan Anda sedang diantar!*\n\n";
  text += "🏪 " + (tokoNama || "Toko") + "\n";
  text += "Siap-siap ya, pesanan segera sampai!\n\n";
  text += "👉 " + domain + "\n\n";
  text += "_Loman — Belanja Setetangga_";
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

// Ke PEMBELI: pesanan selesai
export function notifPesananSelesai(buyerPhone, tokoNama) {
  if (!buyerPhone) return null;
  var phone = formatPhone(buyerPhone);
  var text = "🎉 *Pesanan selesai!*\n\n";
  text += "Terima kasih sudah pesan di " + (tokoNama || "Toko") + "!\n\n";
  text += "👉 Pesan lagi di:\n";
  text += domain + "\n\n";
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
