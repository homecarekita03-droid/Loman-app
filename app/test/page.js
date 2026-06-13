"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";

export default function TestPage() {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  function log(msg, type) {
    setResults(function(prev) {
      return prev.concat([{ msg: msg, type: type || "info", time: new Date().toLocaleTimeString() }]);
    });
  }

  async function runTests() {
    setTesting(true);
    setResults([]);
    log("Memulai diagnosa Firebase...", "info");

    // Test 1: Cek Firebase Config
    log("Test 1: Cek konfigurasi Firebase...", "info");
    try {
      if (db) {
        log("✅ Firebase DB terkoneksi", "success");
      } else {
        log("❌ Firebase DB tidak terkoneksi", "error");
        setTesting(false);
        return;
      }
    } catch (e) {
      log("❌ Error Firebase config: " + e.message, "error");
    }

    // Test 2: Cek Firestore READ
    log("Test 2: Cek baca Firestore...", "info");
    try {
      var snap = await getDocs(collection(db, "toko"));
      log("✅ Baca toko berhasil: " + snap.docs.length + " dokumen", "success");
    } catch (e) {
      log("❌ Gagal baca Firestore: " + e.message, "error");
      log("→ Kemungkinan: Security Rules belum di-set", "error");
    }

    // Test 3: Cek Firestore WRITE
    log("Test 3: Cek tulis Firestore...", "info");
    try {
      var testRef = await addDoc(collection(db, "_test"), {
        test: true,
        timestamp: new Date().toISOString(),
        from: "diagnostic"
      });
      log("✅ Tulis berhasil! Doc ID: " + testRef.id, "success");
      log("→ Hapus dokumen test '_test/" + testRef.id + "' di Firebase Console", "info");
    } catch (e) {
      log("❌ Gagal tulis Firestore: " + e.message, "error");
      log("→ KEMUNGKINAN BESAR: Security Rules memblokir write!", "error");
    }

    // Test 4: Cek produk collection
    log("Test 4: Cek koleksi produk...", "info");
    try {
      var produkSnap = await getDocs(collection(db, "produk"));
      log("✅ Baca produk berhasil: " + produkSnap.docs.length + " produk", "success");
    } catch (e) {
      log("❌ Gagal baca produk: " + e.message, "error");
    }

    // Test 5: Cek users collection
    log("Test 5: Cek koleksi users...", "info");
    try {
      var usersSnap = await getDocs(collection(db, "users"));
      log("✅ Baca users berhasil: " + usersSnap.docs.length + " users", "success");
    } catch (e) {
      log("❌ Gagal baca users: " + e.message, "error");
    }

    log("Diagnosa selesai!", "info");
    setTesting(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "24px", fontFamily: "monospace" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "8px" }}>🔧 Firebase Diagnostic</h1>
      <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>
        Halaman ini untuk mendiagnosa masalah koneksi Firebase.
        Hapus file ini setelah selesai diagnosa.
      </p>

      <button
        onClick={runTests}
        disabled={testing}
        style={{
          padding: "12px 24px",
          borderRadius: "10px",
          background: testing ? "#475569" : "linear-gradient(135deg, #f59e0b, #ea580c)",
          color: "white",
          border: "none",
          fontWeight: 700,
          fontSize: "14px",
          cursor: testing ? "default" : "pointer",
          marginBottom: "20px",
        }}
      >
        {testing ? "⏳ Testing..." : "🔍 Jalankan Diagnosa"}
      </button>

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {results.map(function(r, i) {
            var bgColor = "rgba(255,255,255,0.03)";
            var textColor = "#94a3b8";
            if (r.type === "success") { bgColor = "rgba(16,185,129,0.1)"; textColor = "#34d399"; }
            if (r.type === "error") { bgColor = "rgba(239,68,68,0.1)"; textColor = "#f87171"; }

            return (
              <div key={i} style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: bgColor,
                fontSize: "13px",
                color: textColor,
                display: "flex",
                gap: "10px",
              }}>
                <span style={{ color: "#64748b", fontSize: "11px", flexShrink: 0 }}>{r.time}</span>
                <span>{r.msg}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "30px", padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>📋 Cara Fix Firebase Rules</h3>
        <ol style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 2, paddingLeft: "16px" }}>
          <li>Buka <a href="https://console.firebase.google.com" target="_blank" style={{ color: "#60a5fa" }}>Firebase Console</a></li>
          <li>Pilih project <b>loman-app</b></li>
          <li>Klik <b>Firestore Database</b> → tab <b>Rules</b></li>
          <li>Ganti isi rules dengan:</li>
        </ol>
        <pre style={{
          background: "rgba(0,0,0,0.3)",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "11px",
          color: "#34d399",
          overflow: "auto",
          marginTop: "8px",
        }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
        </pre>
        <p style={{ fontSize: "11px", color: "#f59e0b", marginTop: "8px" }}>
          ⚠️ Klik <b>Publish</b> setelah ganti rules!
        </p>
      </div>
    </div>
  );
}
