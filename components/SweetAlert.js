"use client";
import { useState, useEffect } from "react";

var alertQueue = [];
var setAlertState = null;

// Fungsi global untuk panggil alert dari mana saja
export function showAlert(options) {
  alertQueue.push(options);
  if (setAlertState) setAlertState(function(prev) { return [...alertQueue]; });
}

// Shortcut functions
export function alertSuccess(title, text) {
  showAlert({ type: "success", title: title, text: text });
}

export function alertError(title, text) {
  showAlert({ type: "error", title: title, text: text });
}

export function alertInfo(title, text) {
  showAlert({ type: "info", title: title, text: text });
}

export function alertConfirm(title, text, onConfirm) {
  showAlert({ type: "confirm", title: title, text: text, onConfirm: onConfirm });
}

// Icons per type
var icons = {
  success: { emoji: "✅", bg: "#d1fae5", color: "#059669", ring: "#10b981" },
  error: { emoji: "❌", bg: "#fee2e2", color: "#dc2626", ring: "#ef4444" },
  info: { emoji: "💡", bg: "#dbeafe", color: "#2563eb", ring: "#3b82f6" },
  warning: { emoji: "⚠️", bg: "#fef3c7", color: "#d97706", ring: "#f59e0b" },
  confirm: { emoji: "❓", bg: "#fef3c7", color: "#d97706", ring: "#f59e0b" },
  order: { emoji: "🛒", bg: "#fef3c7", color: "#d97706", ring: "#f59e0b" },
  delivery: { emoji: "🛵", bg: "#e0e7ff", color: "#7c3aed", ring: "#8b5cf6" },
};

export default function SweetAlertProvider() {
  var [alerts, setAlerts] = useState([]);

  useEffect(function() {
    setAlertState = setAlerts;
    return function() { setAlertState = null; };
  }, []);

  function closeAlert(index) {
    alertQueue.splice(index, 1);
    setAlerts(function() { return [...alertQueue]; });
  }

  function handleConfirm(index, onConfirm) {
    if (onConfirm) onConfirm();
    closeAlert(index);
  }

  if (alerts.length === 0) return null;

  var alert = alerts[0];
  var icon = icons[alert.type] || icons.info;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      animation: "fadeIn 0.2s ease",
    }} onClick={function() { if (alert.type !== "confirm") closeAlert(0); }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{
        background: "white", borderRadius: "24px", padding: "32px 24px",
        maxWidth: "340px", width: "100%", textAlign: "center",
        animation: "slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        {/* Icon */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: icon.bg, border: "3px solid " + icon.ring,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "32px", margin: "0 auto 16px",
          animation: "bounceIn 0.5s ease 0.1s both",
        }}>
          {alert.icon || icon.emoji}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: "20px", fontWeight: 800, color: "#1f2937",
          marginBottom: "8px",
        }}>{alert.title || "Notifikasi"}</h3>

        {/* Text */}
        {alert.text && (
          <p style={{
            fontSize: "14px", color: "#6b7280", lineHeight: 1.6,
            marginBottom: "24px",
          }}>{alert.text}</p>
        )}

        {/* Buttons */}
        {alert.type === "confirm" ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={function() { closeAlert(0); }} style={{
              flex: 1, padding: "14px", borderRadius: "14px",
              background: "#f3f4f6", border: "none", fontWeight: 600,
              fontSize: "15px", color: "#6b7280", cursor: "pointer",
            }}>Batal</button>
            <button onClick={function() { handleConfirm(0, alert.onConfirm); }} style={{
              flex: 1, padding: "14px", borderRadius: "14px",
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              border: "none", fontWeight: 700, fontSize: "15px",
              color: "white", cursor: "pointer",
            }}>{alert.confirmText || "Ya, Lanjut"}</button>
          </div>
        ) : (
          <button onClick={function() { closeAlert(0); }} style={{
            width: "100%", padding: "14px", borderRadius: "14px",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            border: "none", fontWeight: 700, fontSize: "15px",
            color: "white", cursor: "pointer",
          }}>{alert.buttonText || "OK"}</button>
        )}
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
