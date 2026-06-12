"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";

export default function NotifButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { setUserData } = useAuth();

  const aktifkan = async () => {
    setLoading(true);
    setResult(null);

    try {
      if (!("Notification" in window)) {
        setResult({ type: "error", msg: "Browser tidak mendukung notifikasi. Gunakan Chrome/Edge di Android." });
        setLoading(false);
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setResult({ type: "error", msg: "Service Worker tidak didukung." });
        setLoading(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setResult({ type: "error", msg: "Izin notifikasi ditolak. Aktifkan di Pengaturan HP → Aplikasi → Chrome → Notifikasi." });
        setLoading(false);
        return;
      }

      // Register service worker
      let swReg = await navigator.serviceWorker.getRegistration("/");
      if (!swReg) {
        swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
      }
      swReg = await navigator.serviceWorker.ready;

      // Get FCM token
      const { getMessaging, getToken } = await import("firebase/messaging");
      const { app } = await import("@/lib/firebase");
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: "BMPd5AdlH0nMWs5ud8OjuA0YAuspnGkgOciggnp6S55mvCBlaavRgMz8RpHVVcPaX_i7KJeKchSb_zaZ91H-kes",
        serviceWorkerRegistration: swReg,
      });

      if (token && auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          fcmToken: token,
          notifEnabled: true,
          notifEnabledAt: new Date().toISOString(),
        });
        // Update local state supaya banner hilang tanpa refresh
        setUserData(prev => ({ ...prev, notifEnabled: true, fcmToken: token }));
        setResult({ type: "success", msg: "Notifikasi HP aktif! HP akan bergetar + notifikasi muncul di layar saat pesanan masuk." });
      } else if (!token) {
        setResult({ type: "error", msg: "Gagal mendapatkan token. Coba restart browser." });
      }
    } catch (e) {
      console.error("Notif error:", e);
      let errMsg = "Gagal: " + e.message;
      if (e.message.includes("VAPID")) errMsg = "VAPID key tidak valid. Generate di Firebase Console → Cloud Messaging → Web Push certificates.";
      else if (e.message.includes("permission")) errMsg = "Izin notifikasi diblokir. Buka Pengaturan HP → Chrome → Notifikasi → Izinkan.";
      setResult({ type: "error", msg: errMsg });
    }
    setLoading(false);
  };

  // Tombol ON/OFF
  const { userData } = useAuth();
  const isActive = userData?.notifEnabled;

  if (isActive && result?.type !== "error") {
    return (
      <div style={{
        background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        padding: "14px", borderRadius: "14px", textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>✅</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#065f46" }}>Notifikasi HP Aktif</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={aktifkan} disabled={loading} style={{
        width: "100%", padding: "14px", borderRadius: "14px",
        background: loading ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
        color: "white", border: "none", fontWeight: 700, fontSize: "15px",
        cursor: loading ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      }}>
        {loading ? "⌛ Menghubungkan..." : "🔔 Aktifkan Notifikasi HP"}
      </button>
      {result?.type === "error" && (
        <div style={{ marginTop: "10px", padding: "12px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p style={{ fontSize: "12px", color: "#dc2626", lineHeight: 1.5 }}>⚠️ {result.msg}</p>
        </div>
      )}
    </div>
  );
}
