import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCr7BbmYQ42EtxkTJ9zP0iGtRsvxOVlIo8",
  authDomain: "loman-app.firebaseapp.com",
  projectId: "loman-app",
  storageBucket: "loman-app.firebasestorage.app",
  messagingSenderId: "642027415706",
  appId: "1:642027415706:web:0c0f7f49133183ab405723",
  measurementId: "G-F2LYE5Q6P0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
