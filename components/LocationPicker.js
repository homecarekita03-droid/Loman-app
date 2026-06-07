"use client";
import { useState, useEffect } from "react";

export default function LocationPicker({ onSelect, onClose, initialLat, initialLng }) {
  const [pos, setPos] = useState({ lat: initialLat || -6.2, lng: initialLng || 106.8 });
  const [address, setAddress] = useState("Memuat lokasi...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
          if (!initialLat) setPos(newPos);
          setLoading(false);
          fetchAddress(initialLat ? { lat: initialLat, lng: initialLng } : newPos);
        },
        () => { setLoading(false); fetchAddress(pos); },
        { enableHighAccuracy: true }
      );
    } else {
      setLoading(false);
      fetchAddress(pos);
    }
  }, []);

  async function fetchAddress(p) {
    try {
      const res = await fetch(
        "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + p.lat + "&lon=" + p.lng + "&zoom=18"
      );
      const data = await res.json();
      setAddress(data.display_name || "Lokasi terpilih");
    } catch (e) {
      setAddress("Lat: " + p.lat.toFixed(6) + ", Lng: " + p.lng.toFixed(6));
    }
  }

  function handleMapClick() {
    // Open Google Maps untuk pilih lokasi
    const url = "https://www.google.com/maps?q=" + pos.lat + "," + pos.lng + "&z=18";
    window.open(url, "_blank");
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "white", width: "100%", maxWidth: "480px",
        borderRadius: "24px 24px 0 0", padding: "24px 20px 32px",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>📍 Atur Lokasi</h3>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>

        {/* Map Preview */}
        <div style={{
          width: "100%", height: "200px", borderRadius: "16px",
          overflow: "hidden", marginBottom: "16px", position: "relative",
          background: "#e5e7eb",
        }}>
          <img
            src={"https://maps.googleapis.com/maps/api/staticmap?center=" + pos.lat + "," + pos.lng + "&zoom=16&size=600x300&markers=color:orange%7C" + pos.lat + "," + pos.lng + "&key=AIzaSyCr7BbmYQ42EtxkTJ9zP0iGtRsvxOVlIo8"}
            alt="Map"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#dbeafe,#bfdbfe)"><div style=\"font-size:48px\">📍</div><p style=\"font-size:13px;color:#4b5563;margin-top:8px\">Lat: ' + pos.lat.toFixed(4) + ', Lng: ' + pos.lng.toFixed(4) + '</p></div>';
            }}
          />
          {/* Center Pin */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -100%)",
            fontSize: "32px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}>📍</div>
        </div>

        {/* Address */}
        <div style={{
          background: "#f9fafb", borderRadius: "12px", padding: "12px 14px",
          marginBottom: "16px", fontSize: "13px", color: "#4b5563", lineHeight: 1.5,
        }}>
          <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Alamat terdeteksi:</p>
          {address}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => {
            navigator.geolocation?.getCurrentPosition(
              (p) => {
                const np = { lat: p.coords.latitude, lng: p.coords.longitude };
                setPos(np);
                fetchAddress(np);
              },
              () => alert("Tidak bisa mengakses GPS. Izinkan akses lokasi di pengaturan browser."),
              { enableHighAccuracy: true }
            );
          }} style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            background: "white", border: "2px solid #e5e7eb",
            fontWeight: 600, fontSize: "14px", color: "#374151", cursor: "pointer",
          }}>🎯 Gunakan Lokasi Saya Sekarang</button>

          <button onClick={handleMapClick} style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            background: "white", border: "2px solid #e5e7eb",
            fontWeight: 600, fontSize: "14px", color: "#374151", cursor: "pointer",
          }}>🗺️ Buka di Google Maps</button>

          <button onClick={() => {
            onSelect(pos, address);
            onClose();
          }} style={{
            width: "100%", padding: "15px", borderRadius: "14px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "white", border: "none", fontWeight: 700, fontSize: "15px",
            cursor: "pointer", boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
          }}>✅ Konfirmasi Lokasi Ini</button>
        </div>
      </div>
    </div>
  );
}
