
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import SweetAlertProvider from "@/components/SweetAlert";
import PWAInstall from "@/components/PWAInstall";

const SITE_URL = "https://loman.store";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Loman — Belanja dari Tetangga, Semudah Scroll HP | Marketplace UMKM",
    template: "%s | Loman Marketplace",
  },
  description:
    "Loman adalah marketplace UMKM perumahan. Pesan makanan, kue, laundry, dan kebutuhan harian dari tetangga Anda — antar langsung ke rumah, bayar COD. Gratis tanpa download!",
  keywords: [
    "marketplace perumahan",
    "belanja tetangga",
    "UMKM digital",
    "jualan online perumahan",
    "catering terdekat",
    "laundry perumahan",
    "makanan tetangga",
    "Loman",
    "local market nusantara",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Loman",
    title: "Loman — Belanja dari Tetangga, Semudah Scroll HP 📱 | Marketplace UMKM Perumahan",
    description:
      "Temukan makanan, kue, laundry, dan kebutuhan harian dari tetangga Anda di Loman. Pesan mudah, antar ke rumah, bayar COD. Marketplace UMKM perumahan terpercaya!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Loman — Marketplace UMKM Perumahan. Belanja dari Tetangga!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Loman — Belanja dari Tetangga, Semudah Scroll HP | Marketplace UMKM",
    description:
      "Loman marketplace UMKM perumahan. Pesan makanan, kue, laundry dari tetangga — antar langsung ke rumah, bayar COD. Gratis tanpa download!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {},
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
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://loman.store" />
        {/* JSON-LD Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Loman",
              url: SITE_URL,
              description:
                "Marketplace UMKM perumahan. Belanja dari tetangga — semudah scroll HP.",
              applicationCategory: "ShoppingApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
              },
            }),
          }}
        />
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


