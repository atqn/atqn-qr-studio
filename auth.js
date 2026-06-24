import { auth } from "./firebase.js";
import {
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ======================
   LOGIN
====================== */
export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

/* ======================
   LOGOUT (REAL FIX)
====================== */
async function logout() {
  try {
    await signOut(auth);
    window.location.replace("login.html");
  } catch (e) {
    console.error(e);
  }
}

/* ======================
   RESET PASSWORD
====================== */
export async function resetPassword(email) {
  return await sendPasswordResetEmail(auth, email);
}

/* ======================
   AUTH GUARD
====================== */
export function authGuard(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.replace("login.html");
      return;
    }
    callback(user);
  });
}

/* ======================
   🔥 أهم سطر في الحل
====================== */
window.logout = logout;
