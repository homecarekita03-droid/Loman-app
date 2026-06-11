import { useState } from 'react';
import { getMessaging, getToken } from "firebase/messaging";
import { db, auth } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function NotifButton() {
  const [loading, setLoading] = useState(false);

  const aktifkanNotif = async () => {
    setLoading(true);
    try {
      const messaging = getMessaging();
      // Minta izin ke HP
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Ambil kunci unik HP ini
        const token = await getToken(messaging, { 
          vapidKey: 'BMPd5AdlH0nMWs5ud8OjuA0YAuspnGkgOciggnp6S55mvCBlaavRgMz8RpHVVcPaX_i7KJeKchSb_zaZ91H-kes' 
        });
        
        if (token && auth.currentUser) {
          // Simpan kuncinya ke database Loman
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            fcmToken: token
          });
          alert("✅ Berhasil! Anda akan menerima notifikasi di HP ini.");
        }
      } else {
        alert("Izin ditolak. Silakan aktifkan di pengaturan browser.");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengaktifkan notifikasi.");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={aktifkanNotif}
      disabled={loading}
      className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
    >
      {loading ? "Menghubungkan..." : "🔔 Aktifkan Notifikasi HP"}
    </button>
  );
}
