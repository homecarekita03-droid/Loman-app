"use client";

export const sendWA = (phone, message) => {
  if (typeof window === 'undefined') return;
  let f = phone.replace(/[^0-9]/g, '');
  if (f.startsWith('0')) f = '62' + f.slice(1);
  window.open("https://wa.me/" + f + "?text=" + encodeURIComponent(message), '_blank');
};

export const notifTemplates = {
  newOrder: (s, i, t, a) => "Halo " + s + ", ada PESANAN BARU! Detail: " + i + ". Total: " + t + ". Alamat: " + a,
  orderReady: (b, s) => "Halo " + b + ", pesananmu SIAP & " + s + " 🛵"
};

export const notifPesananBaru = notifTemplates.newOrder;
export const notifPesananDiterima = (n) => "Pesanan " + n + " diterima!";
export const notifPesananDiproses = (n) => "Pesanan " + n + " diproses!";
export const notifPesananDiantar = (n) => "Pesanan " + n + " diantar!";
export const notifPesananDikirim = (n) => "Pesanan " + n + " dikirim!";
export const notifPesananSelesai = (n) => "Pesanan " + n + " selesai!";

const waNotif = { sendWA, notifTemplates, notifPesananBaru, notifPesananSelesai };
export default waNotif;
