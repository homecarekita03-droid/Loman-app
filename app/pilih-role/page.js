"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

export default function PilihRolePage() {
  const router = useRouter();
  const { user, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  async function selectRole(role) {
    if (!user) { router.push("/login"); return; }
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { role });
      setUserData(prev => ({ ...prev, role }));
      router.push(role === "seller" ? "/seller" : "/buyer");
    } catch (err) { console.error(err); alert("Gagal. Coba lagi."); }
    setLoading(false);
  }

  const cardStyle = (hoverColor) => ({
    width: "100%", display: "flex", alignItems: "center", gap: "16px",
    padding: "20px", background: "white", border: "2px solid #e5e7eb",
    borderRadius: "18px", textAlign: "left", cursor: "pointer",
    transition: "all 0.2s", opacity: loading ? 0.5 : 1,
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: "#f9fafb",
    }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "56px", marginBottom: "12px" }}>👋</div>
        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937" }}>Selamat Datang!</h1>
        <p style={{ color: "#6b7280", marginTop: "8px", fontSize: "15px" }}>Anda ingin menggunakan Loman sebagai?</p>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
        <button onClick={() => selectRole("buyer")} disabled={loading} style={cardStyle()}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#eff6ff"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "white"; }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "18px", background: "#dbeafe",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0,
          }}>🛒</div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>Pembeli</h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Cari & pesan produk dari tetangga perumahan</p>
          </div>
        </button>

        <button onClick={() => selectRole("seller")} disabled={loading} style={cardStyle()}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.background = "#fffbeb"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "white"; }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "18px", background: "#fef3c7",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0,
          }}>🏪</div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>Penjual</h3>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Jual produk Anda ke warga perumahan</p>
          </div>
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "32px", textAlign: "center" }}>
        💡 Anda bisa mengubah role ini nanti di pengaturan profil
      </p>
    </div>
  );
}
