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
   LOGOUT
====================== */
export async function logout() {

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
   GUARD (PROTECTION)
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

