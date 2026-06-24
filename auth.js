import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
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
export async function logout() {

  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (e) {
    console.error("Logout error:", e);
  }
}

/* ======================
   RESET PASSWORD
====================== */
export async function resetPassword(email) {

  return await sendPasswordResetEmail(auth, email);
}

/* ======================
   GUARD
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
   GLOBAL LOGOUT (for HTML onclick)
====================== */
window.logout = logout;
