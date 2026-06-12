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
    // Ambil data toko → ambil pemilikId
    const tokoSnap = await db.doc("toko/" + tokoId).get();
    if (!tokoSnap.exists) return;
    const pemilikId = tokoSnap.data().pemilikId;

    // Ambil FCM token seller
    const userSnap = await db.doc("users/" + pemilikId).get();
    if (!userSnap.exists) return;
    const fcmToken = userSnap.data().fcmToken;
    if (!fcmToken) return;

    // Kirim push notification
    await getMessaging().send({
      token: fcmToken,
      notification: {
        title: "🛒 Pesanan Baru dari " + pembeliNama,
        body: itemCount + " item: " + itemNames + " — Rp " + totalHarga.toLocaleString("id"),
      },
      webpush: {
        headers: { Urgency: "high" },
        notification: {
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: "pesanan-" + event.params.orderId,
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 300],
          actions: [
            { action: "open", title: "Buka Loman" },
          ],
        },
      },
      android: {
        priority: "high",
        notification: {
          channelId: "loman-orders",
          sound: "default",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
    });

    console.log("Notifikasi terkirim ke:", pemilikId);
  } catch (error) {
    console.error("Gagal kirim notifikasi:", error);
  }
});
