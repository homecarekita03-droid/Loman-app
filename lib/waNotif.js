export const sendWA = (phone, message) => {
  if (typeof window === 'undefined') return;
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  }
  const url = "https://wa.me/" + formattedPhone + "?text=" + encodeURIComponent(message);
  window.open(url, '_blank');
};

export const notifTemplates = {
  newOrder: (sellerName, items, total, address) => {
    return "Halo " + sellerName + ", ada PESANAN BARU di Loman!\n\nDetail: " + items + "\nTotal: Rp " + total + "\nAlamat: " + address;
  },
  orderReady: (buyerName, status) => {
    return "Halo " + buyerName + ", pesananmu di Loman SUDAH SIAP!\nStatus: " + status + " 🛵\n\nDitunggu ya!";
  }
};

// JEMBATAN PENGHUBUNG (Agar kode lama tidak error)
export const notifPesananBaru = notifTemplates.newOrder;
export const notifPesananSelesai = notifTemplates.orderReady;
export const notifPesananDiantar = notifTemplates.orderReady;
export const notifPesananDiterima = (nama) => "Pesanan " + nama + " diterima!";
