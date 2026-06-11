"use client";
import { useState, useEffect } from "react";

export default function PWAInstall() {
  var [show, setShow] = useState(false);
  var [deferredPrompt, setDeferredPrompt] = useState(null);
  var [isIOS, setIsIOS] = useState(false);
  var [isInstalled, setIsInstalled] = useState(false);

  useEffect(function() {
    // Cek apakah sudah diinstall
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Cek apakah sudah pernah dismiss
    var dismissed = localStorage.getItem("loman_pwa_dismissed");
    if (dismissed) {
      var dismissedTime = parseInt(dismissed);
      // Tampilkan lagi setelah 7 hari
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    var ua = navigator.userAgent || "";
    var iosDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);

    // Android/Desktop: listen for beforeinstallprompt
    function handlePrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      // Tampilkan setelah 3 detik (biar user sempat lihat app dulu)
      setTimeout(function() { setShow(true); }, 3000);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);

    // iOS: tampilkan panduan manual setelah 5 detik
    if (iosDevice && !window.matchMedia("(display-mode: standalone)").matches) {
      setTimeout(function() { setShow(true); }, 5000);
    }

    return function() { window.removeEventListener("beforeinstallprompt", handlePrompt); };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      var result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShow(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem("loman_pwa_dismissed", String(Date.now()));
  }

  if (isInstalled || !show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      padding: "0",
    }}>
      <div style={{
        background: "white", width: "100%", maxWidth: "480px",
        borderRadius: "24px 24px 0 0", padding: "28px 24px 32px",
        animation: "slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "18px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "0 8px 24px rgba(245,158,11,0.3)",
          }}>
            <span style={{ fontSize: "32px", fontWeight: 900, color: "white" }}>L</span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#1f2937" }}>
            Install Loman di HP Anda!
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "6px", lineHeight: 1.5 }}>
            Akses lebih cepat, tanpa perlu buka browser
          </p>
        </div>

        {/* Benefits */}
        <div style={{
          background: "#f9fafb", borderRadius: "16px", padding: "16px",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: "⚡", text: "Buka langsung dari layar HP" },
              { icon: "🔔", text: "Notifikasi pesanan real-time" },
              { icon: "📱", text: "Tampilan fullscreen seperti app" },
              { icon: "💾", text: "Tanpa download dari Play Store" },
            ].map(function(b, i) {
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{b.icon}</span>
                  <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{b.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isIOS ? (
          /* iOS: Panduan manual */
          <div>
            <div style={{
              background: "#1f2937", borderRadius: "14px", padding: "16px",
              marginBottom: "16px", color: "white",
            }}>
              <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>Cara install di iPhone/iPad:</p>
              {[
                { num: "1", text: "Tap tombol Share 📤 di bawah browser" },
                { num: "2", text: 'Scroll ke bawah, tap "Add to Home Screen"' },
                { num: "3", text: 'Tap "Add" di pojok kanan atas' },
              ].map(function(s, i) {
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0" }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 800, flexShrink: 0,
                    }}>{s.num}</div>
                    <span style={{ fontSize: "13px" }}>{s.text}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={handleDismiss} style={{
              width: "100%", padding: "14px", borderRadius: "14px",
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              border: "none", fontWeight: 700, fontSize: "15px",
              color: "white", cursor: "pointer",
            }}>Mengerti, Saya Coba!</button>
          </div>
        ) : (
          /* Android/Desktop: Tombol install */
          <div>
            <button onClick={handleInstall} style={{
              width: "100%", padding: "16px", borderRadius: "14px",
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              border: "none", fontWeight: 800, fontSize: "16px",
              color: "white", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
              marginBottom: "10px",
            }}>📲 Install Sekarang — Gratis!</button>
          </div>
        )}

        <button onClick={handleDismiss} style={{
          width: "100%", padding: "12px", borderRadius: "14px",
          background: "none", border: "none", color: "#9ca3af",
          fontSize: "14px", cursor: "pointer",
        }}>Nanti saja</button>
      </div>
    </div>
  );
}
