import { getAuth, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

/* ======================
   BLOCK BACK BUTTON CACHE
====================== */
window.addEventListener("pageshow", (event) => {

    if (event.persisted) {
        window.location.reload();
    }
});

/* ======================
   FORCE NO BACK AFTER LOGOUT
====================== */
if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    window.location.reload();
}

/* ======================
   AUTH GUARD
====================== */
onAuthStateChanged(auth, (user) => {

    const page = location.pathname.split("/").pop();

    const publicPages = ["login.html"];

    if (!user && !publicPages.includes(page)) {
        window.location.replace("login.html");
        return;
    }

    /* ======================
       EXTRA SECURITY LAYER
    ====================== */
    if (user) {

        sessionStorage.setItem("auth", "1");

    } else {

        sessionStorage.removeItem("auth");
    }
});

/* ======================
   HARD BLOCK ACCESS VIA CACHE
====================== */
window.addEventListener("load", () => {

    if (!sessionStorage.getItem("auth")) {

        const page = location.pathname.split("/").pop();

        if (page !== "login.html") {
            window.location.replace("login.html");
        }
    }
});
