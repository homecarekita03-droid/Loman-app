"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";

export default function SplashPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  useEffect(() => {
    if (!loading && user && userData && userData.role) {
      router.push(userData.role === "seller" ? "/seller" : "/buyer");
    }
  }, [user, userData, loading, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute", top: "-50px", right: "-50px",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
      }}></div>
      <div style={{
        position: "absolute", bottom: "-80px", left: "-60px",
        width: "250px", height: "250px", borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
      }}></div>

      {/* Logo */}
      <div style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
        transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}>
        <div style={{
          width: "110px", height: "110px",
          background: "white",
          borderRadius: "28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          marginLeft: "auto", marginRight: "auto",
        }}>
          <span style={{ fontSize: "56px", fontWeight: 900, color: "#f59e0b" }}>L</span>
        </div>
      </div>

      {/* Text */}
      <div style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease 0.2s",
        textAlign: "center",
      }}>
        <h1 style={{
          fontSize: "42px", fontWeight: 900, color: "white",
          letterSpacing: "-1px", marginBottom: "4px",
        }}>Loman</h1>
        <p style={{
          color: "rgba(255,255,255,0.7)", fontSize: "12px",
          letterSpacing: "4px", textTransform: "uppercase",
          marginBottom: "16px",
        }}>Local Market Nusantara</p>
        <p style={{
          color: "rgba(255,255,255,0.9)", fontSize: "16px",
        }}>Belanja Setetangga 🏘️</p>
      </div>

      {/* Button */}
      <div style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.6s ease 0.4s",
      }}>
        <button
          onClick={() => router.push("/login")}
          style={{
            marginTop: "40px",
            background: "white",
            color: "#ea580c",
            fontWeight: 700,
            fontSize: "18px",
            padding: "16px 48px",
            borderRadius: "50px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          Mulai Sekarang
        </button>
      </div>

      {/* Footer */}
      <div style={{
        opacity: show ? 1 : 0,
        transition: "all 0.6s ease 0.6s",
        marginTop: "32px",
        textAlign: "center",
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: 1.6 }}>
          Marketplace untuk warga perumahan<br/>
          Pesan makanan, kue, laundry dari tetangga
        </p>
        <div style={{
          display: "flex", gap: "8px", justifyContent: "center",
          marginTop: "16px",
        }}>
          {["🍚", "🧁", "🥤", "👕", "🧴"].map((e, i) => (
            <span key={i} style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
