// ============================================
// 🎨 SweetAlert + PWA Install Prompt
// ============================================
// Jalankan: node tambah-sweetalert-pwa.js
// ============================================

const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trimStart());
  console.log("  ✅ " + filePath);
}

console.log("");
console.log("🎨 ========================================");
console.log("   SweetAlert + PWA Install Prompt");
console.log("========================================");
console.log("");

// =============================================
// 1. CUSTOM SWEET ALERT COMPONENT
// =============================================
writeFile("components/SweetAlert.js", `
"use client";
import { useState, useEffect } from "react";

var alertQueue = [];
var setAlertState = null;

// Fungsi global untuk panggil alert dari mana saja
export function showAlert(options) {
  alertQueue.push(options);
  if (setAlertState) setAlertState(function(prev) { return [...alertQueue]; });
}

// Shortcut functions
export function alertSuccess(title, text) {
  showAlert({ type: "success", title: title, text: text });
}

export function alertError(title, text) {
  showAlert({ type: "error", title: title, text: text });
}

export function alertInfo(title, text) {
  showAlert({ type: "info", title: title, text: text });
}

export function alertConfirm(title, text, onConfirm) {
  showAlert({ type: "confirm", title: title, text: text, onConfirm: onConfirm });
}

// Icons per type
var icons = {
  success: { emoji: "✅", bg: "#d1fae5", color: "#059669", ring: "#10b981" },
  error: { emoji: "❌", bg: "#fee2e2", color: "#dc2626", ring: "#ef4444" },
  info: { emoji: "💡", bg: "#dbeafe", color: "#2563eb", ring: "#3b82f6" },
  warning: { emoji: "⚠️", bg: "#fef3c7", color: "#d97706", ring: "#f59e0b" },
  confirm: { emoji: "❓", bg: "#fef3c7", color: "#d97706", ring: "#f59e0b" },
  order: { emoji: "🛒", bg: "#fef3c7", color: "#d97706", ring: "#f59e0b" },
  delivery: { emoji: "🛵", bg: "#e0e7ff", color: "#7c3aed", ring: "#8b5cf6" },
};

export default function SweetAlertProvider() {
  var [alerts, setAlerts] = useState([]);

  useEffect(function() {
    setAlertState = setAlerts;
    return function() { setAlertState = null; };
  }, []);

  function closeAlert(index) {
    alertQueue.splice(index, 1);
    setAlerts(function() { return [...alertQueue]; });
  }

  function handleConfirm(index, onConfirm) {
    if (onConfirm) onConfirm();
    closeAlert(index);
  }

  if (alerts.length === 0) return null;

  var alert = alerts[0];
  var icon = icons[alert.type] || icons.info;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      animation: "fadeIn 0.2s ease",
    }} onClick={function() { if (alert.type !== "confirm") closeAlert(0); }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{
        background: "white", borderRadius: "24px", padding: "32px 24px",
        maxWidth: "340px", width: "100%", textAlign: "center",
        animation: "slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        {/* Icon */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: icon.bg, border: "3px solid " + icon.ring,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "32px", margin: "0 auto 16px",
          animation: "bounceIn 0.5s ease 0.1s both",
        }}>
          {alert.icon || icon.emoji}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: "20px", fontWeight: 800, color: "#1f2937",
          marginBottom: "8px",
        }}>{alert.title || "Notifikasi"}</h3>

        {/* Text */}
        {alert.text && (
          <p style={{
            fontSize: "14px", color: "#6b7280", lineHeight: 1.6,
            marginBottom: "24px",
          }}>{alert.text}</p>
        )}

        {/* Buttons */}
        {alert.type === "confirm" ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={function() { closeAlert(0); }} style={{
              flex: 1, padding: "14px", borderRadius: "14px",
              background: "#f3f4f6", border: "none", fontWeight: 600,
              fontSize: "15px", color: "#6b7280", cursor: "pointer",
            }}>Batal</button>
            <button onClick={function() { handleConfirm(0, alert.onConfirm); }} style={{
              flex: 1, padding: "14px", borderRadius: "14px",
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              border: "none", fontWeight: 700, fontSize: "15px",
              color: "white", cursor: "pointer",
            }}>{alert.confirmText || "Ya, Lanjut"}</button>
          </div>
        ) : (
          <button onClick={function() { closeAlert(0); }} style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            border: "none", fontWeight: 700, fontSize: "15px",
            color: "white", cursor: "pointer",
          }}>{alert.buttonText || "OK"}</button>
        )}
      </div>

      <style>{\`
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      \`}</style>
    </div>
  );
}
`);

// =============================================
// 2. PWA INSTALL PROMPT COMPONENT
// =============================================
writeFile("components/PWAInstall.js", `
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
`);

// =============================================
// 3. UPDATE LAYOUT — Tambah SweetAlert & PWA
// =============================================
writeFile("app/layout.js", `
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import SweetAlertProvider from "@/components/SweetAlert";
import PWAInstall from "@/components/PWAInstall";

export const metadata = {
  title: "Loman - Local Market Nusantara",
  description: "Belanja Setetangga — Marketplace UMKM Perumahan",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f59e0b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <SweetAlertProvider />
          <PWAInstall />
        </AuthProvider>
      </body>
    </html>
  );
}
`);

// =============================================
// 4. UPDATE KERANJANG — Ganti alert() dengan SweetAlert
// =============================================
var keranjangPath = "app/buyer/keranjang/page.js";
if (fs.existsSync(keranjangPath)) {
  var c = fs.readFileSync(keranjangPath, "utf-8");

  // Tambah import SweetAlert jika belum ada
  if (!c.includes("alertSuccess")) {
    c = c.replace(
      'import BottomNav from "@/components/BottomNav";',
      'import BottomNav from "@/components/BottomNav";\nimport { alertSuccess, alertError } from "@/components/SweetAlert";'
    );

    // Ganti alert("Gagal") dengan alertError
    c = c.replace(
      'alert("Gagal. Coba lagi.");',
      'alertError("Gagal", "Tidak bisa membuat pesanan. Coba lagi.");'
    );

    fs.writeFileSync(keranjangPath, c);
    console.log("  ✅ " + keranjangPath + " (SweetAlert)");
  }
}

// =============================================
// 5. UPDATE SELLER PRODUK — Ganti alert() & confirm()
// =============================================
var produkPath = "app/seller/produk/page.js";
if (fs.existsSync(produkPath)) {
  var c = fs.readFileSync(produkPath, "utf-8");

  if (!c.includes("alertSuccess")) {
    c = c.replace(
      'import BottomNav from "@/components/BottomNav";',
      'import BottomNav from "@/components/BottomNav";\nimport { alertSuccess, alertError } from "@/components/SweetAlert";'
    );

    c = c.replace(/alert\("Gagal simpan\."\)/g, 'alertError("Gagal", "Tidak bisa menyimpan produk.")');
    c = c.replace(/alert\("Maks 5MB"\)/g, 'alertError("Terlalu Besar", "Ukuran foto maksimal 5MB.")');

    fs.writeFileSync(produkPath, c);
    console.log("  ✅ " + produkPath + " (SweetAlert)");
  }
}

// =============================================
// 6. UPDATE TOKO SETTING — Ganti alert()
// =============================================
var tokoPath = "app/seller/toko-setting/page.js";
if (fs.existsSync(tokoPath)) {
  var c = fs.readFileSync(tokoPath, "utf-8");

  if (!c.includes("alertSuccess")) {
    c = c.replace(
      'import BottomNav from "@/components/BottomNav";',
      'import BottomNav from "@/components/BottomNav";\nimport { alertSuccess, alertError } from "@/components/SweetAlert";'
    );

    c = c.replace(/alert\("Gagal menyimpan\."\)/g, 'alertError("Gagal", "Tidak bisa menyimpan pengaturan.")');
    c = c.replace(/alert\("Maksimal 5MB"\)/g, 'alertError("Terlalu Besar", "Ukuran gambar maksimal 5MB.")');

    fs.writeFileSync(tokoPath, c);
    console.log("  ✅ " + tokoPath + " (SweetAlert)");
  }
}

// =============================================
// 7. UPDATE PROFIL — Ganti alert()
// =============================================
var profilPath = "app/buyer/profil/page.js";
if (fs.existsSync(profilPath)) {
  var c = fs.readFileSync(profilPath, "utf-8");

  if (!c.includes("alertError")) {
    c = c.replace(
      'import BottomNav from "@/components/BottomNav";',
      'import BottomNav from "@/components/BottomNav";\nimport { alertError, alertConfirm } from "@/components/SweetAlert";'
    );

    c = c.replace(/alert\("Gagal\."\)/g, 'alertError("Gagal", "Tidak bisa menyimpan profil.")');

    fs.writeFileSync(profilPath, c);
    console.log("  ✅ " + profilPath + " (SweetAlert)");
  }
}

// =============================================
// 8. Service Worker untuk PWA
// =============================================
writeFile("public/sw.js", `
// Loman Service Worker
var CACHE_NAME = "loman-v1";
var urlsToCache = ["/", "/login", "/buyer", "/seller"];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
`);

// =============================================
// 9. Update manifest.json
// =============================================
writeFile("public/manifest.json", `
{
  "name": "Loman - Local Market Nusantara",
  "short_name": "Loman",
  "description": "Belanja Setetangga — Marketplace UMKM Perumahan",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f59e0b",
  "orientation": "portrait",
  "categories": ["shopping", "food"],
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [],
  "prefer_related_applications": false
}
`);

// =============================================
// 10. Register Service Worker di halaman utama
// =============================================
var pagePath = "app/page.js";
if (fs.existsSync(pagePath)) {
  var c = fs.readFileSync(pagePath, "utf-8");
  if (!c.includes("serviceWorker")) {
    c = c.replace(
      'useEffect(() => {',
      `useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(function(e) { console.log("SW:", e); });
    }
  }, []);

  useEffect(() => {`
    );
    fs.writeFileSync(pagePath, c);
    console.log("  ✅ " + pagePath + " (SW registered)");
  }
}

console.log("");
console.log("🎉 ========================================");
console.log("   SWEETALERT + PWA SELESAI!");
console.log("========================================");
console.log("");
console.log("   🎨 SWEETALERT:");
console.log("   ✅ Modal cantik (bukan alert browser jelek)");
console.log("   ✅ Animasi bounce-in");
console.log("   ✅ Icon berwarna (success/error/info/confirm)");
console.log("   ✅ Tombol dengan gradient");
console.log("   ✅ Bisa pakai di semua halaman");
console.log("");
console.log("   📲 PWA INSTALL:");
console.log("   ✅ Popup install muncul otomatis (setelah 3 detik)");
console.log("   ✅ Tombol 'Install Sekarang' (Android)");
console.log("   ✅ Panduan manual step-by-step (iPhone)");
console.log("   ✅ 4 benefit ditampilkan");
console.log("   ✅ 'Nanti saja' → muncul lagi setelah 7 hari");
console.log("   ✅ Tidak muncul jika sudah di-install");
console.log("   ✅ Service Worker untuk offline support");
console.log("");
console.log("   npm run dev");
console.log("   git add . && git commit -m 'sweetalert pwa' && git push");
console.log("");
