import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

/* ======================
   LOGOUT GLOBAL FUNCTION
====================== */
window.logout = async function () {

    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (e) {
        console.error("Logout Error:", e);
        alert("حدث خطأ أثناء تسجيل الخروج");
    }
};
