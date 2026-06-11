"use client";

export const sendWA = (phone, message) => {
  if (typeof window === 'undefined') return;
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
  const url = "https://wa.me/" + formattedPhone + "?text=" + encodeURIComponent(message);
  window.open(url, '_blank');
};

export const notifTemplates = {
  newOrder: (s, i, t, a) => "Halo " + s + ", ada PESANAN BARU! Detail: " + i + ". Total: Rp " + t + ". Alamat: " + a,
  orderReady: (b, s) => "Halo " + b + ", pesananmu SIAP & " + s + " 🛵"
};

export const notifPesananBaru = (s, i, t, a) => notifTemplates.newOrder(s, i, t, a);
export const notifPesananDiterima = (n) => "Pesanan " + n + " diterima!";
export const notifPesananDiproses = (n) => "Pesanan " + n + " diproses!";
export const notifPesananDiantar = (n) => "Pesanan " + n + " diantar!";
export const notifPesananDikirim = (n) => "Pesanan " + n + " dikirim!";
export const notifPesananSelesai = (n) => "Pesanan " + n + " selesai!";

const waNotif = { sendWA, notifTemplates, notifPesananBaru, notifPesananSelesai };
export default waNotif;
