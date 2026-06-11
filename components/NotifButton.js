"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function NotifButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(""); // "success" | "error" | ""

  const aktifkan = async () => {
    setLoading(true);
    setStatus("");
    try {
      // 1. Cek support
      if (!("Notification" in window)) {
        alert("Browser Anda tidak mendukung notifikasi. Gunakan Chrome/Edge.");
        setLoading(false);
        return;
      }

      // 2. Minta izin
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("error");
        setLoading(false);
        return;
      }

      // 3. Ambil FCM token
      const { getMessaging, getToken } = await import("firebase/messaging");
      const { app } = await import("@/lib/firebase");

      // Cek apakah service worker sudah terdaftar
      let swReg = null;
      if ("serviceWorker" in navigator) {
        swReg = await navigator.serviceWorker.getRegistration("/");
        if (!swReg) {
          swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          await swReg.update();
        }
      }

      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: "BMBQbhqtYimoKZD1nafdp4cejG5TeiDNIhELkG6V1YhGc78_28eEoxBEm_a5YMCqOD7TQBH6ZiYIOpUGprBqoJo",
        serviceWorkerRegistration: swReg,
      });

      // 4. Simpan token ke Firestore
      if (token && auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          fcmToken: token,
          notifEnabled: true,
          notifEnabledAt: new Date().toISOString(),
        });
        setStatus("success");
      } else if (!token) {
        alert("Gagal mendapatkan token. Coba restart browser.");
      }
    } catch (e) {
      console.error("Notif error:", e);
      setStatus("error");
    }
    setLoading(false);
  };

  if (status === "success") {
    return (
      <div style={{
        background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        padding: "14px", borderRadius: "14px", textAlign: "center",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      }}>
        <span style={{ fontSize: "18px" }}>✅</span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#065f46" }}>Notifikasi HP Aktif!</span>
      </div>
    );
  }

  return (
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
  );
}
