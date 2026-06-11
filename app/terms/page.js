import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdated = "11 Juni 2026"; 

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white text-center shadow-lg">
        <h1 className="text-2xl font-bold">Syarat & Ketentuan</h1>
        <p className="text-sm opacity-90 text-orange-100">Terakhir diperbarui: {lastUpdated}</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">1. Definisi</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Loman:</strong> Platform marketplace penghubung penjual dan pembeli di lingkup perumahan.</li>
              <li><strong>Pengguna:</strong> Setiap individu yang mengakses Loman (Pembeli/Penjual).</li>
              <li><strong>Penjual:</strong> Pengguna yang menawarkan produk/jasa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">2. Peran Loman</h2>
            <p>Loman adalah platform perantara (marketplace). Kami tidak memiliki, menjual, atau mengirimkan produk secara langsung. Kontrak jual beli terjadi langsung antara Penjual dan Pembeli.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">3. Kewajiban Pengguna</h2>
            <p>Pengguna wajib memberikan informasi yang akurat (nama, nomor WhatsApp, alamat). Penjual dilarang menjual barang yang melanggar hukum Indonesia (narkotika, barang ilegal, dll).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">4. Transaksi & Pembayaran</h2>
            <p>Saat ini, pembayaran dilakukan langsung antara Penjual dan Pembeli (COD/Transfer Mandiri). Loman tidak bertanggung jawab atas kegagalan pembayaran, namun kami berhak memblokir pengguna yang melanggar kepercayaan komunitas.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-orange-600 mb-2">5. Pembatasan Tanggung Jawab</h2>
            <p>Loman tidak bertanggung jawab atas kerugian, cedera, atau sengketa yang timbul dari kualitas produk atau interaksi antar pengguna di luar sistem aplikasi.</p>
          </section>

          <div className="pt-6 border-t border-gray-100">
            <Link href="/" className="block w-full bg-orange-500 text-white text-center py-3 rounded-xl font-bold hover:bg-orange-600 transition">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
