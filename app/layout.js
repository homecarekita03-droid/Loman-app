import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import PWAInstall from "@/components/PWAInstall";

export const metadata = {
  title: "Loman - Local Market Nusantara",
  description: "Belanja Setetangga — Marketplace UMKM Perumahan",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          {children}
          <PWAInstall />
        </AuthProvider>
      </body>
    </html>
  );
}