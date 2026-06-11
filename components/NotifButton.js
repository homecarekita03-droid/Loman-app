import { useState } from 'react';
import { getMessaging, getToken } from "firebase/messaging";
import { db, auth } from "../lib/firebase"; 
import { doc, updateDoc } from "firebase/firestore";

export default function NotifButton() {
  const [loading, setLoading] = useState(false);
  const aktifkan = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const messaging = getMessaging();
        const token = await getToken(messaging, { vapidKey: 'BMPd5AdlH0nMWs5ud8OjuA0YAuspnGkgOciggnp6S55mvCBlaavRgMz8RpHVVcPaX_i7KJeKchSb_zaZ91H-kes' });
        if (token && auth.currentUser) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), { fcmToken: token });
          alert("✅ Notifikasi Aktif!");
        }
      }
    } catch (e) { alert("Gagal: " + e.message); }
    setLoading(false);
  };
  return (
    <button onClick={aktifkan} className="bg-orange-500 text-white p-3 rounded-xl w-full font-bold mb-4">
      {loading ? "⌛ Loading..." : "🔔 Aktifkan Notifikasi HP"}
    </button>
  );
}
