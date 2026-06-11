"use client";
import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function RatingSimpel({ orderId, onFinish }) {
  const [rating, setRating] = useState(0);
  const kirimRating = async (bintang) => {
    try {
      const orderRef = doc(db, 'pesanan', orderId);
      await updateDoc(orderRef, { status: 'Selesai', rating: bintang });
      alert("Terima kasih! Rating " + bintang + " bintang terkirim.");
      if (onFinish) onFinish();
    } catch (e) { alert("Gagal kirim rating"); }
  };
  return (
    <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-200 mt-2">
      <p className="text-sm font-bold mb-2">Gimana pesanannya? Kasih rating yuk:</p>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => kirimRating(star)} className="text-3xl active:scale-125 transition">
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    </div>
  );
}
