"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function NotifButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // {type, msg}

  const aktifkan = async () => {
    setLoading(true);
    setResult(null);

    try {
      // 1. Cek support
      if (!("Notification" in window)) {
        setResult({ type: "error", msg: "Browser tidak mendukung notifikasi. Gunakan Chrome/Edge di Android." });
        setLoading(false);
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setResult({ type: "error", msg: "Service Worker tidak didukung. Gunakan Chrome/Edge." });
        setLoading(false);
        return;
      }

      // 2. Minta izin notifikasi
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setResult({ type: "error", msg: "Izin notifikasi ditolak. Aktifkan di Pengaturan HP → Aplikasi → Chrome → Notifikasi." });
        setLoading(false);
        return;
      }

      // 3. Register service worker
      let swReg = null;
      try {
        swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
        // Tunggu sampai SW aktif
        if (swReg.installing) {
          await new Promise((resolve) => {
            swReg.installing.addEventListener("statechange", (e) => {
              if (e.target.state === "activated") resolve();
            });
          });
        } else if (swReg.waiting) {
          swReg.waiting.postMessage({ type: "SKIP_WAITING" });
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        // Refresh untuk dapat SW yang aktif
        swReg = await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.error("SW error:", swErr);
        setResult({ type: "error", msg: "Gagal register service worker: " + swErr.message });
        setLoading(false);
        return;
      }

      // 4. Ambil FCM token
      try {
        const { getMessaging, getToken } = await import("firebase/messaging");
        const { app } = await import("@/lib/firebase");

        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
          vapidKey: "BMPd5AdlH0nMWs5ud8OjuA0YAuspnGkgOciggnp6S55mvCBlaavRgMz8RpHVVcPaX_i7KJeKchSb_zaZ91H-kes",
          serviceWorkerRegistration: swReg,
        });

        if (token) {
          // 5. Simpan token ke Firestore
          if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              fcmToken: token,
              notifEnabled: true,
              notifEnabledAt: new Date().toISOString(),
            });
          }
          setResult({ type: "success", msg: "Notifikasi HP berhasil diaktifkan! Sekarang Anda akan menerima notifikasi saat ada pesanan masuk." });
        } else {
          setResult({ type: "error", msg: "Gagal mendapatkan token FCM. Kemungkinan VAPID key belum benar. Generate di Firebase Console → Project Settings → Cloud Messaging → Web Push certificates." });
        }
      } catch (fcmErr) {
        console.error("FCM error:", fcmErr);
        let errMsg = "Gagal mengaktifkan notifikasi: " + fcmErr.message;
        if (fcmErr.message.includes("VAPID")) {
          errMsg = "VAPID key tidak valid. Generate key baru di Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Generate key pair. Lalu paste di components/NotifButton.js";
        } else if (fcmErr.message.includes("messaging/permission")) {
          errMsg = "Izin notifikasi diblokir. Buka Pengaturan HP → Aplikasi → Chrome → Notifikasi → Izinkan.";
        } else if (fcmErr.message.includes("fetch")) {
          errMsg = "Gagal terhubung ke server. Cek koneksi internet dan coba lagi.";
        }
        setResult({ type: "error", msg: errMsg });
      }
    } catch (e) {
      console.error("Notif error:", e);
      setResult({ type: "error", msg: "Error tidak terduga: " + e.message });
    }

    setLoading(false);
  };

  // Status berhasil
  if (result?.type === "success") {
    return (
      <div style={{
        background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        padding: "16px", borderRadius: "14px", textAlign: "center",
      }}>
        <div style={{ fontSize: "28px", marginBottom: "6px" }}>✅</div>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#065f46" }}>{result.msg}</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={aktifkan}
        disabled={loading}
        style={{
          width: "100%", padding: "14px", borderRadius: "14px",
          background: loading ? "#d1d5db" : "linear-gradient(135deg, #f59e0b, #ea580c)",
          color: "white", border: "none", fontWeight: 700, fontSize: "15px",
          cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          boxShadow: loading ? "none" : "0 4px 16px rgba(245,158,11,0.3)",
        }}
      >
        {loading ? "⌛ Menghubungkan..." : "🔔 Aktifkan Notifikasi HP"}
      </button>

      {/* Error message */}
      {result?.type === "error" && (
        <div style={{
          marginTop: "10px", padding: "12px", borderRadius: "12px",
          background: "#fef2f2", border: "1px solid #fecaca",
        }}>
          <p style={{ fontSize: "12px", color: "#dc2626", lineHeight: 1.5 }}>
            ⚠️ {result.msg}
          </p>
        </div>
      )}
    </div>
  );
}
