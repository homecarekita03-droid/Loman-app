"use client";
import { useState, useEffect } from "react";

// Hitung jarak antara 2 koordinat (Haversine formula) — hasil dalam KM
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Format jarak
export function formatDistance(km) {
  if (km < 0.1) return "< 100m";
  if (km < 1) return Math.round(km * 1000) + "m";
  return km.toFixed(1) + " km";
}

// Hook untuk dapatkan lokasi user
export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GPS tidak didukung di browser ini");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError("Izinkan akses lokasi untuk melihat toko terdekat");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { location, error, loading };
}
