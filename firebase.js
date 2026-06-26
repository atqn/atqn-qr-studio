import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmgkN6Glpa0ly_d4e8heB0TiCmV6ieKbw",
  authDomain: "atqn-qr1.firebaseapp.com",
  projectId: "atqn-qr1",
  storageBucket: "atqn-qr1.firebasestorage.app",
  messagingSenderId: "867770918097",
  appId: "1:867770918097:web:419b4dc7fefe9e1c4d51f0"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const booksRef = doc(db, "books", "global");

export {
  app,
  db,
  auth,
  booksRef,
  doc,
  getDoc,
  setDoc,
  onSnapshot
};
