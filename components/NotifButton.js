"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";

export default function NotifButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { userData, setUserData } = useAuth();

  // Cek status notifikasi dari browser + Firestore
  const [notifPermission, setNotifPermission] = useState("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const isActive = userData?.notifEnabled && notifPermission === "granted";

  const aktifkan = async () => {
    setLoading(true);
    setResult(null);

    try {
      if (!("Notification" in window)) {
        setResult({ type: "error", msg: "Browser tidak mendukung notifikasi. Gunakan Chrome/Edge di Android." });
        setLoading(false);
        return;
      }

      const permission = await Notification.requestPermission();
      setNotifPermission(permission);

      if (permission !== "granted") {
        setResult({ type: "error", msg: "Izin notifikasi ditolak. Aktifkan di: Pengaturan HP → Aplikasi → Chrome → Notifikasi → Izinkan." });
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
        // Simpan ke Firestore (pakai setDoc merge supaya aman)
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          fcmToken: token,
          notifEnabled: true,
          notifEnabledAt: new Date().toISOString(),
        }, { merge: true });

        // Update local state
        setUserData(prev => ({ ...prev, notifEnabled: true, fcmToken: token }));
        setResult({ type: "success", msg: "Notifikasi HP aktif! HP akan bergetar + notifikasi muncul di layar saat pesanan masuk." });
      } else {
        setResult({ type: "error", msg: "Gagal mendapatkan token. Coba restart browser." });
      }
    } catch (e) {
      console.error("Notif error:", e);
      setResult({ type: "error", msg: "Gagal: " + e.message });
    }
    setLoading(false);
  };

  const matikan = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          notifEnabled: false,
          fcmToken: null,
        }, { merge: true });
        setUserData(prev => ({ ...prev, notifEnabled: false, fcmToken: null }));
      }
      setResult(null);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // ===== TAMPILAN AKTIF (ON) =====
  if (isActive) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        padding: "14px", borderRadius: "14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>✅</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#065f46" }}>Notifikasi HP Aktif</span>
          </div>
          <button onClick={matikan} disabled={loading} style={{
            padding: "6px 12px", borderRadius: "8px",
            background: "white", border: "1px solid #a7f3d0",
            fontSize: "12px", fontWeight: 600, color: "#065f46",
            cursor: "pointer",
          }}>
            {loading ? "..." : "Matikan"}
          </button>
        </div>
      </div>
    );
  }

  // ===== TAMPILAN NONAKTIF (OFF) =====
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
