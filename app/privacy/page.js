import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = "11 Juni 2026";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white text-center shadow-lg">
        <h1 className="text-2xl font-bold">Kebijakan Privasi</h1>
        <p className="text-sm opacity-90 text-orange-100">Privasi Anda adalah prioritas kami</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 text-gray-700 leading-relaxed">
          
          <p className="italic text-sm text-gray-500">
            Loman berkomitmen melindungi data pribadi Anda sesuai dengan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
          </p>

          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">1. Data yang Kami Kumpulkan</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Identitas:</strong> Nama, email, dan nomor WhatsApp.</li>
              <li><strong>Lokasi:</strong> Koordinat GPS untuk fitur "Toko Terdekat".</li>
              <li><strong>Transaksi:</strong> Riwayat pesanan dan chat antar pengguna.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">2. Penggunaan Data</h2>
            <p>Kami menggunakan data Anda untuk memfasilitasi komunikasi pesanan, menghitung jarak toko, dan memberikan notifikasi status pesanan secara real-time.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">3. Keamanan</h2>
            <p>Data Anda disimpan di server terenkripsi. Kami tidak akan menjual atau menyebarkan data pribadi Anda kepada pihak ketiga untuk tujuan komersial tanpa izin Anda.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">4. Hak Anda</h2>
            <p>Anda berhak memperbarui, meminta salinan, atau meminta penghapusan data pribadi Anda kapan saja dengan menghubungi admin kami.</p>
          </section>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-sm text-orange-800">
              <strong>Butuh bantuan?</strong> Hubungi admin di <span className="font-bold underline">homecarekita03@gmail.com</span>
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <Link href="/" className="block w-full bg-orange-500 text-white text-center py-3 rounded-xl font-bold hover:bg-orange-600 transition">
              Saya Mengerti
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
