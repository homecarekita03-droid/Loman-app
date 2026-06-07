# 🔒 Firebase Firestore Rules

Buka Firebase Console → Firestore Database → Rules
Ganti isinya dengan ini:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    // Toko
    match /toko/{tokoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    // Produk
    match /produk/{produkId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    // Pesanan
    match /pesanan/{pesananId} {
      allow read, write: if request.auth != null;
    }
    // Chats
    match /chats/{chatId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Klik **Publish** untuk menyimpan.
