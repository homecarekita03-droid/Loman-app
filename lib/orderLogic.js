import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { sendWA } from './waNotif';

export const updateOrderStatus = async (order) => {
  if (order.newStatus === 'Diantar') {
    const pesan = "Halo " + order.buyerName + ", pesananmu sudah SIAP dan sedang DIANTAR 🛵. Ditunggu ya!";
    sendWA(order.buyerPhone, pesan);
  }
  const orderRef = doc(db, 'pesanan', order.id);
  await updateDoc(orderRef, { status: order.newStatus });
};
