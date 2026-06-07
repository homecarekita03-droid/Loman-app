// ============================================
// 🔧 Fix Status: Dimasak → Diproses
// ============================================
// Jalankan: node fix-status-diproses.js
// ============================================

const fs = require("fs");

console.log("");
console.log("🔧 Fixing status Dimasak → Diproses...");
console.log("");

const files = [
  "app/seller/page.js",
  "app/seller/pesanan/page.js",
  "app/buyer/pesanan/page.js",
];

let totalFixes = 0;

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log("  ⚠️ File tidak ditemukan: " + filePath);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let fixes = 0;

  // Ganti semua "cooking" → "processing" (sebagai status value)
  const replacements = [
    // Status string values
    [/\"cooking\"/g, '"processing"'],
    [/'cooking'/g, "'processing'"],

    // Status labels
    [/🍳 Dimasak/g, '🔄 Diproses'],
    [/Dimasak/g, 'Diproses'],
    [/Mulai Masak 🍳/g, 'Mulai Proses 🔄'],
    [/Mulai Masak/g, 'Mulai Proses'],

    // Emoji references for cooking status
    [/cooking\?"🍳/g, 'processing?"🔄'],
  ];

  replacements.forEach(([find, replace]) => {
    const before = content;
    content = content.replace(find, replace);
    if (content !== before) fixes++;
  });

  if (fixes > 0) {
    fs.writeFileSync(filePath, content);
    console.log("  ✅ " + filePath + " (" + fixes + " perubahan)");
    totalFixes += fixes;
  } else {
    console.log("  ℹ️ " + filePath + " (tidak ada yang perlu diubah)");
  }
});

console.log("");
console.log("🎉 Selesai! Total " + totalFixes + " perubahan.");
console.log("");
console.log("   Status flow sekarang:");
console.log("   ⏳ Menunggu → ✅ Diterima → 🔄 Diproses → 🛵 Diantar → ✅ Selesai");
console.log("");
console.log("   Jalankan: npm run dev");
console.log("   Deploy:  git add . && git commit -m 'fix status diproses' && git push");
console.log("");
