"use client";
import { useRouter } from "next/navigation";

export default function BottomNav({ role, active }) {
  const router = useRouter();

  const buyerMenu = [
    { id: "home", icon: "🏠", iconActive: "🏠", label: "Beranda", path: "/buyer" },
    { id: "cart", icon: "🛒", iconActive: "🛒", label: "Keranjang", path: "/buyer/keranjang" },
    { id: "orders", icon: "📋", iconActive: "📋", label: "Pesanan", path: "/buyer/pesanan" },
    { id: "profile", icon: "👤", iconActive: "👤", label: "Profil", path: "/buyer/profil" },
  ];

  const sellerMenu = [
    { id: "home", icon: "📊", iconActive: "📊", label: "Dashboard", path: "/seller" },
    { id: "products", icon: "📦", iconActive: "📦", label: "Produk", path: "/seller/produk" },
    { id: "orders", icon: "📋", iconActive: "📋", label: "Pesanan", path: "/seller/pesanan" },
    { id: "profile", icon: "👤", iconActive: "👤", label: "Profil", path: "/seller/profil" },
  ];

  const menu = role === "seller" ? sellerMenu : buyerMenu;

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: "480px",
      background: "white",
      borderTop: "1px solid #f3f4f6",
      display: "flex", justifyContent: "space-around",
      padding: "6px 0 10px",
      zIndex: 100,
      boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
    }}>
      {menu.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => router.push(item.path)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "2px", padding: "4px 12px", background: "none", border: "none",
            cursor: "pointer", position: "relative",
          }}>
            {/* Active indicator */}
            {isActive && <div style={{
              position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)",
              width: "24px", height: "3px", borderRadius: "2px",
              background: "linear-gradient(90deg, #f59e0b, #ea580c)",
            }}></div>}
            <span style={{
              fontSize: "22px",
              filter: isActive ? "none" : "grayscale(0.5)",
              opacity: isActive ? 1 : 0.6,
              transition: "all 0.2s",
            }}>{item.icon}</span>
            <span style={{
              fontSize: "10px", fontWeight: isActive ? 800 : 500,
              color: isActive ? "#f59e0b" : "#9ca3af",
              transition: "all 0.2s",
            }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
