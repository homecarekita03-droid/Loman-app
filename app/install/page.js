"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function InstallPage() {
  const router = useRouter();
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    var ua = navigator.userAgent || "";
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    setIsAndroid(/Android/.test(ua));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#1f2937" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
        padding: "32px 24px 40px", textAlign: "center",
        borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}></div>
        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}></div>

        <div style={{
          width: "80px", height: "80px", background: "white",
          borderRadius: "24px", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 16px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
        }}>
          <span style={{ fontSize: "42px", fontWeight: 900, color: "#f59e0b" }}>L</span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "white", marginBottom: "6px" }}>
          Install Loman
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
          Pasang di HP — buka kapan saja, tanpa ketik URL
        </p>
      </div>

      {/* Benefits */}
      <div style={{ padding: "24px", maxWidth: "440px", margin: "0 auto" }}>
        <div style={{
          background: "#f9fafb", borderRadius: "20px", padding: "20px",
          marginTop: "-20px", position: "relative", zIndex: 5,
          boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "⚡", text: "Buka 1 tap dari layar HP" },
              { icon: "🔔", text: "Notifikasi pesanan masuk" },
              { icon: "📱", text: "Tampilan full seperti app native" },
              { icon: "💾", text: "Tanpa download dari Play Store" },
              { icon: "🔄", text: "Update otomatis, selalu versi terbaru" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>{b.icon}</span>
                <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions based on device */}
        <div style={{ marginTop: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937", marginBottom: "16px", textAlign: "center" }}>
            📋 Cara Install
          </h2>

          {/* Android */}
          {isAndroid && (
            <div style={{
              background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
              borderRadius: "20px", padding: "24px", marginBottom: "16px",
              border: "2px solid #a7f3d0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "24px" }}>🤖</span>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#065f46" }}>Android (Chrome)</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { num: "1", text: 'Ketik loman.store di Chrome', bold: true },
                  { num: "2", text: 'Tap tombol Install yang muncul otomatis di bawah', bold: false },
                  { num: "3", text: 'Atau tap menu ⋮ (pojok kanan atas) → "Install app"', bold: false },
                  { num: "4", text: 'Tap "Install" — Selesai! 🎉', bold: true },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 800, color: "white", flexShrink: 0,
                    }}>{s.num}</div>
                    <span style={{ fontSize: "14px", color: "#374151", fontWeight: s.bold ? 700 : 400, lineHeight: 1.5, paddingTop: "3px" }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* iOS */}
          {isIOS && (
            <div style={{
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              borderRadius: "20px", padding: "24px", marginBottom: "16px",
              border: "2px solid #93c5fd",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "24px" }}>🍎</span>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1e40af" }}>iPhone / iPad (Safari)</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { num: "1", text: 'Buka Safari, ketik loman.store' },
                  { num: "2", text: 'Tap tombol Share 📤 di bawah' },
                  { num: "3", text: 'Scroll ke bawah, tap "Add to Home Screen"' },
                  { num: "4", text: 'Tap "Add" di pojok kanan atas 🎉' },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 800, color: "white", flexShrink: 0,
                    }}>{s.num}</div>
                    <span style={{ fontSize: "14px", color: "#374151", lineHeight: 1.5, paddingTop: "3px" }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Default (Desktop / Unknown) */}
          {!isAndroid && !isIOS && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Android instructions */}
              <div style={{
                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                borderRadius: "20px", padding: "24px",
                border: "2px solid #a7f3d0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "24px" }}>🤖</span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#065f46" }}>Android (Chrome)</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { num: "1", text: 'Buka Chrome, ketik loman.store' },
                    { num: "2", text: 'Tap menu ⋮ (pojok kanan atas)' },
                    { num: "3", text: 'Pilih "Install app" atau "Add to Home Screen"' },
                    { num: "4", text: 'Tap "Install" — Selesai! 🎉' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 800, color: "white", flexShrink: 0,
                      }}>{s.num}</div>
                      <span style={{ fontSize: "13px", color: "#374151", lineHeight: 1.5, paddingTop: "2px" }}>{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* iOS instructions */}
              <div style={{
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                borderRadius: "20px", padding: "24px",
                border: "2px solid #93c5fd",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "24px" }}>🍎</span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1e40af" }}>iPhone / iPad (Safari)</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { num: "1", text: 'Buka Safari, ketik loman.store' },
                    { num: "2", text: 'Tap tombol Share 📤 di bawah' },
                    { num: "3", text: 'Scroll ke bawah, tap "Add to Home Screen"' },
                    { num: "4", text: 'Tap "Add" — Selesai! 🎉' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 800, color: "white", flexShrink: 0,
                      }}>{s.num}</div>
                      <span style={{ fontSize: "13px", color: "#374151", lineHeight: 1.5, paddingTop: "2px" }}>{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ marginTop: "28px", textAlign: "center" }}>
          <button onClick={() => router.push("/login")} style={{
            width: "100%", padding: "16px", borderRadius: "16px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "white", border: "none", fontWeight: 800, fontSize: "16px",
            cursor: "pointer", boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
          }}>
            Buka Loman Sekarang 🚀
          </button>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "12px" }}>
            loman.store — Marketplace UMKM Perumahan
          </p>
        </div>
      </div>
    </div>
  );
}
