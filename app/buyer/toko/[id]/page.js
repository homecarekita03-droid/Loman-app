import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StoreDetail from "./TokoClient";

// Generate dynamic metadata untuk OG preview
export async function generateMetadata({ params }) {
  var id = params.id;
  var storeName = "Toko di Loman";
  var storeDesc = "Belanja dari tetangga, semudah scroll HP 📱";
  var storeImage = "https://loman.store/og-image.png";

  try {
    var snap = await getDoc(doc(db, "toko", id));
    if (snap.exists()) {
      var data = snap.data();
      storeName = data.nama || storeName;
      storeDesc = data.deskripsi || ("🏪 " + storeName + " — Belanja di Loman");
      if (data.banner) storeImage = data.banner;
    }
  } catch (e) {}

  return {
    title: storeName + " — Loman",
    description: storeDesc,
    openGraph: {
      title: storeName + " — Loman",
      description: storeDesc,
      url: "https://loman.store/buyer/toko/" + id,
      siteName: "Loman",
      images: [{ url: storeImage, width: 1200, height: 630, alt: storeName }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: storeName + " — Loman",
      description: storeDesc,
      images: [storeImage],
    },
  };
}

export default function TokoPage() {
  return <StoreDetail />;
}
