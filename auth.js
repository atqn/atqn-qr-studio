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
   LOGOUT (FIXED)
====================== */
async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
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
      window.location.href = "login.html";
      return;
    }
    callback(user);
  });
}

/* ======================
   أهم سطر (الحل الحقيقي)
====================== */
window.logout = logout;
