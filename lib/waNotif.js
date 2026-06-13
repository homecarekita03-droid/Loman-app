"use client";

export const sendWA = (phone, message) => {
  if (typeof window === 'undefined') return;
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
  const url = "https://wa.me/" + formattedPhone + "?text=" + encodeURIComponent(message);
  window.open(url, '_blank');
};

// notifTemplates.newOrder(pembeliNama, daftarBarang, totalHarga, alamatPembeli)
export const notifTemplates = {
  newOrder: (buyerName, items, total, address) =>
    "🛒 PESANAN BARU!\n\n" +
    "Dari: " + buyerName + "\n" +
    "Pesanan: " + items + "\n" +
    "Total: Rp " + Number(total).toLocaleString("id") + "\n" +
    "Alamat: " + address + "\n\n" +
    "Buka loman.store untuk konfirmasi pesanan.",
  orderReady: (buyerName, status) =>
    "Halo " + buyerName + ", pesananmu " + status + " 🛵\nCek di loman.store",
};