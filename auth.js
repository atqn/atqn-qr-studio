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
   LOGOUT (FIXED 100%)
====================== */
async function logout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
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
   AUTO GUARD
====================== */
onAuthStateChanged(auth, (user) => {
  const page = location.pathname.split("/").pop();

  if (!user && page !== "login.html") {
    window.location.href = "login.html";
  }
});

/* ======================
   🔥 هذا هو الحل الحقيقي
====================== */
window.logout = logout;

