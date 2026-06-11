"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(function(e) { console.log("SW:", e); });
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user && userData && userData.role) {
        router.push(userData.role === "seller" ? "/seller" : "/buyer");
      } else if (user && userData && !userData.role) {
        router.push("/pilih-role");
      } else {
        router.push("/landing");
      }
    }
  }, [user, userData, loading, router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
    }}>
      <div style={{
        width: "80px", height: "80px", background: "white",
        borderRadius: "22px", display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: "16px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
      }}>
        <span style={{ fontSize: "42px", fontWeight: 900, color: "#f59e0b" }}>L</span>
      </div>
      <h1 style={{ fontSize: "32px", fontWeight: 900, color: "white" }}>Loman</h1>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", letterSpacing: "3px", marginTop: "4px" }}>LOCAL MARKET NUSANTARA</p>
    </div>
  );
}
