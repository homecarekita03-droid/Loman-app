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
