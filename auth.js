import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

/* ======================
   LOGOUT GLOBAL FUNCTION
====================== */
window.logout = async function () {

    await signOut(auth);

    sessionStorage.removeItem("auth");

    window.location.replace("login.html");
};
