import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ======================
   LOGIN FUNCTION
====================== */
export async function login(email, password) {

    return await signInWithEmailAndPassword(auth, email, password);
}

/* ======================
   LOGOUT FUNCTION (FIXED)
====================== */
export async function logout() {

    try {
        await signOut(auth);
        window.location.replace("login.html");
    } catch (error) {
        console.error("Logout error:", error);
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
   GLOBAL ACCESS (IMPORTANT FOR HTML onclick)
====================== */
window.logout = logout;
