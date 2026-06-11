@"
export const sendWA = (phone, message) => {
  // Bersihkan nomor HP agar formatnya benar (62...)
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  }
  
  const url = "https://wa.me/" + formattedPhone + "?text=" + encodeURIComponent(message);
  window.open(url, '_blank');
};

export const notifTemplates = {
  // Dikirim Pembeli ke Penjual saat Checkout
  newOrder: (sellerName, items, total, address) => {
    return "Halo " + sellerName + ", ada PESANAN BARU di Loman!\n\n" +
           "Detail: " + items + "\n" +
           "Total: Rp " + total + "\n" +
           "Alamat: " + address + "\n\n" +
           "Cek detailnya di: loman.store/seller";
  },
  
  // Dikirim Penjual ke Pembeli HANYA saat barang meluncur
  orderReady: (buyerName, status) => {
    return "Halo " + buyerName + ", pesananmu di Loman SUDAH SIAP!\n" +
           "Status: " + status + " 🛵\n\n" +
           "Ditunggu ya, terima kasih sudah belanja setetangga!";
  }
};
"@ | Out-File -FilePath lib/waNotif.js -Encoding utf8