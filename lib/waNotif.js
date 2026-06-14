"use client";

export const sendWA = function(phone, message) {
  if (typeof window === 'undefined') return;
  if (!phone) { console.log("sendWA: no phone"); return; }

  var formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
  if (formattedPhone.length < 8) { console.log("sendWA: invalid phone", formattedPhone); return; }

  var url = "https://wa.me/" + formattedPhone + "?text=" + encodeURIComponent(message);
  console.log("sendWA: opening", url);

  // Coba buka di tab baru, jika gagal redirect di tab yang sama
  var waWindow = window.open(url, '_blank');
  if (!waWindow || waWindow.closed || typeof waWindow.closed === 'undefined') {
    window.location.href = url;
  }
};

export const notifTemplates = {
  newOrder: function(buyerName, items, total, address) {
    return "🛒 PESANAN BARU!\n\n" +
      "Dari: " + buyerName + "\n" +
      "Pesanan: " + items + "\n" +
      "Total: Rp " + Number(total).toLocaleString("id") + "\n" +
      "Alamat: " + (address || "-") + "\n\n" +
      "Buka loman.store untuk konfirmasi pesanan.";
  },
  orderReady: function(buyerName, status) {
    return "Halo " + buyerName + ", pesananmu " + status + " 🛵\nCek di loman.store";
  },
};
