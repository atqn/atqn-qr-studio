import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ======================
   CONFIG
====================== */
const firebaseConfig = {
  apiKey: "AIzaSyBmgkN6Glpa0ly_d4e8heB0TiCmV6ieKbw",
  authDomain: "atqn-qr1.firebaseapp.com",
  projectId: "atqn-qr1",
  storageBucket: "atqn-qr1.firebasestorage.app",
  messagingSenderId: "867770918097",
  appId: "1:867770918097:web:419b4dc7fefe9e1c4d51f0"
};

/* ======================
   INIT APP
====================== */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ======================
   CLEAN EXPORTS (NO WINDOW HACKS)
====================== */
export {
  db,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc
};
