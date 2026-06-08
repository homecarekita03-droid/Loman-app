// ============================================
// 🎨 LOMAN LANDING PAGE — Profesional
// ============================================
// Jalankan: node buat-landing-page.js
// ============================================

const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trimStart());
  console.log("  ✅ " + filePath);
}

console.log("");
console.log("🎨 ========================================");
console.log("   Membuat Landing Page Loman...");
console.log("========================================");
console.log("");

// =============================================
// LANDING PAGE
// =============================================
writeFile("app/landing/page.js", `
"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const features = [
    { icon: "🏪", title: "Katalog Digital", desc: "Semua toko & produk di perumahan Anda dalam satu tempat. Lengkap dengan foto, harga, dan deskripsi." },
    { icon: "🛒", title: "Pesan Langsung", desc: "Pilih produk, masukkan keranjang, pesan — semudah belanja online! Tanpa perlu chat satu-satu." },
    { icon: "💬", title: "Chat Real-time", desc: "Komunikasi langsung dengan penjual. Tanya stok, request khusus, atau koordinasi pengantaran." },
    { icon: "📍", title: "Toko Terdekat", desc: "GPS otomatis menampilkan toko paling dekat dengan rumah Anda. Hemat waktu & ongkir!" },
    { icon: "🔔", title: "Notifikasi", desc: "Update status pesanan real-time. Tahu kapan pesanan diterima, diproses, dan diantar." },
    { icon: "📤", title: "Promosi Mudah", desc: "Penjual bisa share produk ke WhatsApp, Instagram, dan media sosial lainnya dalam 1 klik." },
  ];

  const steps = [
    { num: "1", icon: "📱", title: "Buka & Daftar", desc: "Buka loman.store di browser HP, daftar dengan Google atau email. Gratis!" },
    { num: "2", icon: "🛒", title: "Pilih & Pesan", desc: "Browse toko tetangga, pilih produk favorit, masukkan keranjang, checkout!" },
    { num: "3", icon: "🛵", title: "Terima & Nikmati", desc: "Penjual proses pesanan Anda, antar ke rumah. Bayar di tempat (COD)!" },
  ];

  const faqs = [
    { q: "Apakah Loman gratis?", a: "Ya, 100% gratis untuk pembeli maupun penjual. Tidak ada biaya langganan, tidak ada potongan komisi." },
    { q: "Apakah perlu download di Play Store?", a: "Tidak perlu! Loman berjalan di browser HP. Tapi Anda bisa 'install' seperti app: buka di Chrome → menu (⋮) → 'Add to Home Screen'. Muncul ikon di layar HP!" },
    { q: "Siapa yang mengantar pesanan?", a: "Penjual sendiri yang mengantar (delivery oleh penjual). Karena dalam satu perumahan, jaraknya sangat dekat!" },
    { q: "Bagaimana cara pembayarannya?", a: "Saat ini menggunakan sistem COD (Cash on Delivery) — bayar tunai saat pesanan sampai." },
    { q: "Saya mau jualan, bagaimana caranya?", a: "Daftar di loman.store → pilih 'Penjual' → atur profil toko → upload produk dengan foto → toko Anda langsung tayang! Gratis." },
    { q: "Apakah hanya untuk makanan?", a: "Tidak! Loman bisa untuk semua jenis usaha: makanan, kue, minuman, laundry, kebutuhan rumah tangga, tanaman, dan lainnya." },
  ];

  const testimonials = [
    { name: "Ibu Sari", role: "Penjual Makanan", text: "Dulu saya harus broadcast WA setiap hari. Sekarang tinggal upload menu di Loman, pembeli datang sendiri!", avatar: "👩‍🍳" },
    { name: "Mas Budi", role: "Pembeli", text: "Gampang banget pesan makanan dari tetangga. Tinggal klik-klik, 15 menit sampai!", avatar: "👨" },
    { name: "Mbak Dina", role: "Penjual Kue", text: "Omzet naik 3x sejak pakai Loman. Pelanggan jadi tahu menu saya tanpa harus saya promo terus.", avatar: "👩" },
  ];

  const s = (delay) => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(30px)",
    transition: "all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) " + delay + "s",
  });

  return (
    <div style={{ background:"#ffffff", color:"#1f2937", overflowX:"hidden", maxWidth:"100%", margin:"0 auto" }}>

      {/* ===== HERO ===== */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "40px 24px", position: "relative",
        overflow: "hidden", textAlign: "center",
      }}>
        {/* Background shapes */}
        <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}></div>
        <div style={{ position:"absolute", bottom:"-80px", left:"-80px", width:"300px", height:"300px", borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}></div>
        <div style={{ position:"absolute", top:"40%", right:"-40px", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}></div>

        {/* Logo */}
        <div style={s(0)}>
          <div style={{
            width: "100px", height: "100px", background: "white",
            borderRadius: "28px", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 24px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          }}>
            <span style={{ fontSize: "52px", fontWeight: 900, color: "#f59e0b" }}>L</span>
          </div>
        </div>

        <div style={s(0.1)}>
          <h1 style={{ fontSize: "44px", fontWeight: 900, color: "white", letterSpacing: "-1px", lineHeight: 1.1 }}>Loman</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", letterSpacing: "5px", textTransform: "uppercase", marginTop: "6px" }}>Local Market Nusantara</p>
        </div>

        <div style={s(0.2)}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "white", marginTop: "20px", lineHeight: 1.4, maxWidth: "340px" }}>
            Belanja dari Tetangga,<br/>Semudah Scroll HP 📱
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", marginTop: "12px", lineHeight: 1.6, maxWidth: "320px" }}>
            Marketplace khusus perumahan. Pesan makanan, kue, laundry dari tetangga — antar langsung ke rumah!
          </p>
        </div>

        <div style={s(0.3)}>
          <div style={{ display: "flex", gap: "12px", marginTop: "32px", flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => router.push("/login")} style={{
              padding: "16px 36px", borderRadius: "50px", background: "white",
              color: "#ea580c", fontWeight: 800, fontSize: "16px", border: "none",
              cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              transition: "transform 0.2s",
            }}
            onMouseOver={e=>e.target.style.transform="scale(1.05)"}
            onMouseOut={e=>e.target.style.transform="scale(1)"}>
              Mulai Belanja 🛒
            </button>
            <button onClick={() => router.push("/login")} style={{
              padding: "16px 36px", borderRadius: "50px", background: "rgba(255,255,255,0.15)",
              color: "white", fontWeight: 700, fontSize: "16px",
              border: "2px solid rgba(255,255,255,0.3)",
              cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(4px)",
            }}
            onMouseOver={e=>{e.target.style.background="rgba(255,255,255,0.25)"}}
            onMouseOut={e=>{e.target.style.background="rgba(255,255,255,0.15)"}}>
              Mulai Jualan 🏪
            </button>
          </div>
        </div>

        <div style={s(0.4)}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "24px" }}>
            ✅ Gratis • ✅ Tanpa Download • ✅ Langsung Pakai
          </p>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", animation: "bounce 2s infinite" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "24px" }}>▼</span>
        </div>
      </section>

      {/* ===== MASALAH & SOLUSI ===== */}
      <section style={{ padding: "64px 24px", background: "#f9fafb", textAlign: "center" }}>
        <h2 style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Masalah</h2>
        <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937", lineHeight: 1.3, maxWidth: "400px", margin: "0 auto" }}>
          Kenapa Harus Broadcast WA Setiap Hari? 😩
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
          {[
            "😫 Penjual harus kirim broadcast menu setiap hari",
            "🔍 Pembeli tidak tahu siapa yang jualan apa",
            "📱 Chat WA penuh dengan pesan promosi",
            "📝 Tidak ada katalog produk yang permanen",
            "🤷 Sulit tracking pesanan & status delivery",
          ].map((item, i) => (
            <div key={i} style={{
              background: "white", padding: "14px 18px", borderRadius: "12px",
              fontSize: "14px", color: "#4b5563", textAlign: "left",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>{item}</div>
          ))}
        </div>

        <div style={{ marginTop: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>⬇️</div>
          <h2 style={{ fontSize: "14px", color: "#10b981", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Solusi</h2>
          <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937", lineHeight: 1.3, maxWidth: "400px", margin: "0 auto" }}>
            Loman Mengatasi Semuanya! ✨
          </h3>
          <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "12px", lineHeight: 1.6, maxWidth: "380px", margin: "12px auto 0" }}>
            Satu platform untuk semua kebutuhan belanja di perumahan. Penjual upload sekali, pembeli pesan kapan saja.
          </p>
        </div>
      </section>

      {/* ===== FITUR ===== */}
      <section style={{ padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Fitur</h2>
        <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937", lineHeight: 1.3 }}>Semua yang Anda Butuhkan</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "32px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: "#f9fafb", borderRadius: "18px", padding: "20px 14px",
              textAlign: "center", transition: "transform 0.2s, box-shadow 0.2s",
            }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "16px",
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", margin: "0 auto 12px",
              }}>{f.icon}</div>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "6px" }}>{f.title}</h4>
              <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CARA KERJA ===== */}
      <section style={{ padding: "64px 24px", background: "linear-gradient(135deg, #fffbeb, #fef3c7)", textAlign: "center" }}>
        <h2 style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Cara Kerja</h2>
        <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937", lineHeight: 1.3 }}>Semudah 1-2-3</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "32px", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: "16px", alignItems: "flex-start",
              background: "white", borderRadius: "18px", padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)", textAlign: "left",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 900, fontSize: "18px", flexShrink: 0,
              }}>{step.num}</div>
              <div>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{step.icon}</div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937", marginBottom: "4px" }}>{step.title}</h4>
                <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== UNTUK SIAPA ===== */}
      <section style={{ padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Untuk Siapa</h2>
        <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937", lineHeight: 1.3 }}>Pembeli & Penjual</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
          {/* Pembeli */}
          <div style={{ background: "#eff6ff", borderRadius: "20px", padding: "24px", textAlign: "left" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🛒</div>
            <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#1e40af", marginBottom: "8px" }}>Untuk Pembeli</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {["Lihat semua toko di perumahan", "Pesan makanan, kue, laundry", "Chat langsung dengan penjual", "Tracking pesanan real-time", "Bayar COD (tunai di tempat)"].map((t, i) => (
                <li key={i} style={{ fontSize: "14px", color: "#374151", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#3b82f6" }}>✓</span> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Penjual */}
          <div style={{ background: "#fffbeb", borderRadius: "20px", padding: "24px", textAlign: "left" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏪</div>
            <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#d97706", marginBottom: "8px" }}>Untuk Penjual</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {["Buat toko online gratis", "Upload produk dengan foto", "Terima pesanan otomatis", "Tidak perlu broadcast WA lagi", "Share produk ke medsos 1 klik", "Dashboard penjualan lengkap"].map((t, i) => (
                <li key={i} style={{ fontSize: "14px", color: "#374151", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#f59e0b" }}>✓</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIAL ===== */}
      <section style={{ padding: "64px 24px", background: "#f9fafb", textAlign: "center" }}>
        <h2 style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Testimoni</h2>
        <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937", lineHeight: 1.3 }}>Apa Kata Mereka</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: "white", borderRadius: "18px", padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)", textAlign: "left",
            }}>
              <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.6, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{t.avatar}</div>
                <div>
                  <h5 style={{ fontSize: "13px", fontWeight: 700, color: "#1f2937" }}>{t.name}</h5>
                  <p style={{ fontSize: "11px", color: "#9ca3af" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== INSTALL PWA ===== */}
      <section style={{ padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Install</h2>
        <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937", lineHeight: 1.3 }}>Pasang di HP Anda</h3>
        <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "8px" }}>Tanpa download dari Play Store!</p>

        <div style={{
          background: "linear-gradient(135deg, #1f2937, #374151)",
          borderRadius: "20px", padding: "24px", marginTop: "24px",
          maxWidth: "380px", marginLeft: "auto", marginRight: "auto",
          textAlign: "left", color: "white",
        }}>
          {[
            { num: "1", text: "Buka Chrome di HP" },
            { num: "2", text: "Ketik loman.store" },
            { num: "3", text: "Tap menu ⋮ (pojok kanan atas)" },
            { num: "4", text: 'Pilih "Add to Home Screen"' },
            { num: "5", text: "Tap 'Add' — Selesai! 🎉" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 800, flexShrink: 0,
              }}>{s.num}</div>
              <span style={{ fontSize: "14px" }}>{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding: "64px 24px", background: "#f9fafb" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>FAQ</h2>
          <h3 style={{ fontSize: "26px", fontWeight: 900, color: "#1f2937" }}>Pertanyaan Umum</h3>
        </div>

        <div style={{ maxWidth: "440px", marginLeft: "auto", marginRight: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: "white", borderRadius: "14px", overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} style={{
                width: "100%", padding: "16px 18px", display: "flex",
                justifyContent: "space-between", alignItems: "center",
                background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", flex: 1, paddingRight: "12px" }}>{faq.q}</span>
                <span style={{ fontSize: "18px", color: "#9ca3af", transition: "transform 0.2s", transform: activeFaq === i ? "rotate(180deg)" : "none" }}>▼</span>
              </button>
              {activeFaq === i && (
                <div style={{ padding: "0 18px 16px" }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section style={{
        padding: "64px 24px",
        background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: "white", lineHeight: 1.3, maxWidth: "340px", margin: "0 auto" }}>
          Siap Belanja dari Tetangga? 🏘️
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", marginTop: "12px", maxWidth: "320px", margin: "12px auto 0" }}>
          Bergabung sekarang — gratis, tanpa download, langsung pakai!
        </p>

        <div style={{ display: "flex", gap: "12px", marginTop: "28px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/login")} style={{
            padding: "16px 40px", borderRadius: "50px", background: "white",
            color: "#ea580c", fontWeight: 800, fontSize: "16px", border: "none",
            cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}>Daftar Sekarang — Gratis!</button>
        </div>

        <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "32px" }}>
          {[
            { num: "100%", label: "Gratis" },
            { num: "0 MB", label: "Download" },
            { num: "< 1 mnt", label: "Daftar" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "white" }}>{s.num}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: "32px 24px", background: "#1f2937", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "10px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: "16px" }}>L</span>
          </div>
          <span style={{ color: "white", fontWeight: 800, fontSize: "18px" }}>Loman</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "2px" }}>LOCAL MARKET NUSANTARA</p>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "16px" }}>
          Belanja Setetangga 🏘️
        </p>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginTop: "12px" }}>
          © 2026 Loman. All rights reserved.
        </p>
      </footer>

      {/* Bounce animation */}
      <style>{\`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      \`}</style>
    </div>
  );
}
`);

// =============================================
// UPDATE: Splash page redirect to landing
// =============================================
writeFile("app/page.js", `
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

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
`);

console.log("");
console.log("🎉 ========================================");
console.log("   LANDING PAGE SELESAI!");
console.log("========================================");
console.log("");
console.log("   Halaman: /landing");
console.log("   Sections:");
console.log("   ✅ Hero — CTA Pembeli & Penjual");
console.log("   ✅ Masalah & Solusi");
console.log("   ✅ 6 Fitur Utama (grid)");
console.log("   ✅ Cara Kerja (3 langkah)");
console.log("   ✅ Untuk Siapa (Pembeli & Penjual)");
console.log("   ✅ Testimonial (3 orang)");
console.log("   ✅ Install PWA guide");
console.log("   ✅ FAQ (6 pertanyaan, accordion)");
console.log("   ✅ CTA Final + stats");
console.log("   ✅ Footer");
console.log("   ✅ Auto redirect: belum login → landing");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Buka: http://localhost:3000");
console.log("   (otomatis ke /landing jika belum login)");
console.log("");
console.log("   Deploy:");
console.log("   git add . && git commit -m 'landing page' && git push");
console.log("");
