// ============================================
// 🎨 Pasang Logo Loman sebagai Favicon + PWA Icon
// ============================================
// Jalankan: node pasang-logo.js
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
console.log("🎨 Pasang Logo Loman...");
console.log("");

// Update layout.js — tambah favicon
writeFile("app/layout.js", `
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import SweetAlertProvider from "@/components/SweetAlert";
import PWAInstall from "@/components/PWAInstall";

export const metadata = {
  title: "Loman - Local Market Nusantara",
  description: "Belanja Setetangga — Marketplace UMKM Perumahan",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
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
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
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

console.log("");
console.log("🎉 Selesai!");
console.log("");
console.log("   File ikon yang sudah ada:");
console.log("   ✅ public/icon-512.png (PWA icon besar)");
console.log("   ✅ public/icon-192.png (PWA icon kecil)");
console.log("   ✅ public/favicon.png (tab browser)");
console.log("");
console.log("   ⚠️  PENTING:");
console.log("   Download 3 file ikon dari workspace ini:");
console.log("   - icon-512.png");
console.log("   - icon-192.png");
console.log("   - favicon.png");
console.log("   Copy ke folder public/ di project Anda!");
console.log("");
console.log("   Lalu:");
console.log("   npm run dev");
console.log("   git add . && git commit -m 'logo loman' && git push");
console.log("");
