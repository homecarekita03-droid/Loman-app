const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

exports.notifPesananBaru = onDocumentCreated("pesanan/{orderId}", async (event) => {
  const order = event.data?.data();
  if (!order) return;

  const tokoId = order.tokoId;
  const pembeliNama = order.pembeliNama || "Pembeli";
  const totalHarga = order.totalHarga || 0;
  const itemCount = order.items?.length || 0;
  const itemNames = (order.items || []).map(i => i.nama).join(", ");

  try {
    const tokoSnap = await db.doc("toko/" + tokoId).get();
    if (!tokoSnap.exists) return;
    const pemilikId = tokoSnap.data().pemilikId;

    const userSnap = await db.doc("users/" + pemilikId).get();
    if (!userSnap.exists) return;
    const fcmToken = userSnap.data().fcmToken;
    if (!fcmToken) return;

    await getMessaging().send({
      token: fcmToken,
      notification: {
        title: "🛒 Pesanan Baru!",
        body: pembeliNama + " pesan " + itemCount + " item (" + itemNames + ") — Rp " + totalHarga.toLocaleString("id"),
        imageUrl: "https://loman.store/notif-icon.png",
      },
      webpush: {
        headers: { Urgency: "high" },
        notification: {
          title: "🛒 Pesanan Baru!",
          body: pembeliNama + " pesan " + itemCount + " item (" + itemNames + ") — Rp " + totalHarga.toLocaleString("id"),
          icon: "https://loman.store/notif-icon.png",
          badge: "https://loman.store/notif-icon.png",
          image: "https://loman.store/notif-icon.png",
          tag: "pesanan-" + event.params.orderId,
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 300],
        },
      },
      android: {
        priority: "high",
        notification: {
          channelId: "loman-orders",
          sound: "default",
          icon: "loman",
        },
      },
    });

    console.log("Notifikasi terkirim ke:", pemilikId);
  } catch (error) {
    console.error("Gagal kirim notifikasi:", error);
  }
});
