
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


