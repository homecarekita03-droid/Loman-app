"use client";
import { useState } from "react";
import { db } from "../lib/firebase";
import { doc, updateDoc, getDoc, runTransaction } from "firebase/firestore";

export default function RatingSimpel({ orderId, tokoId, onFinish }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const kirimRating = async (bintang) => {
    if (sending || done) return;
    setRating(bintang);
    setSending(true);
    try {
      // Update pesanan dengan rating
      await updateDoc(doc(db, "pesanan", orderId), { rating: bintang });

      // Update rata-rata rating toko
      if (tokoId) {
        await runTransaction(db, async (transaction) => {
          const tokoRef = doc(db, "toko", tokoId);
          const tokoSnap = await transaction.get(tokoRef);
          if (tokoSnap.exists()) {
            const data = tokoSnap.data();
            const currentCount = data.ratingCount || 0;
            const currentAvg = data.rating || 0;
            const newCount = currentCount + 1;
            const newAvg = ((currentAvg * currentCount) + bintang) / newCount;
            transaction.update(tokoRef, {
              rating: Math.round(newAvg * 10) / 10,
              ratingCount: newCount,
            });
          }
        });
      }

      setDone(true);
    } catch (e) {
      console.error(e);
      alert("Gagal kirim rating. Coba lagi.");
    }
    setSending(false);
  };

  if (done) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        padding: "14px", borderRadius: "14px", textAlign: "center",
        marginTop: "10px",
      }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#065f46" }}>
          ✅ Terima kasih! Rating {rating}⭐ terkirim
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fffbeb", padding: "14px", borderRadius: "14px",
      textAlign: "center", marginTop: "10px",
      border: "1.5px solid #fde68a",
    }}>
      <p style={{ fontSize: "13px", fontWeight: 700, color: "#92400e", marginBottom: "10px" }}>
        Gimana pesanannya? Kasih rating yuk ⭐
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => kirimRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={sending}
            style={{
              width: "40px", height: "40px", borderRadius: "10px",
              border: "none", background: "white",
              fontSize: "22px", cursor: sending ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              transform: (hover >= star || rating >= star) ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.15s",
            }}
          >
            {(hover >= star || rating >= star) ? "⭐" : "☆"}
          </button>
        ))}
      </div>
      {sending && <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>Mengirim...</p>}
    </div>
  );
}
