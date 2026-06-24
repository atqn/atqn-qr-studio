import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

/* ======================
   GLOBAL PROTECTION
====================== */
onAuthStateChanged(auth, (user) => {

    const page = location.pathname.split("/").pop();

    // اسم صفحة الدخول (لا نحميها)
    const publicPages = ["login.html"];

    if (!user && !publicPages.includes(page)) {
        window.location.href = "login.html";
    }

});
