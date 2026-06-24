import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

/* انتظار جاهزية Firebase */
const waitAuth = () => {

    onAuthStateChanged(auth, (user) => {

        const page = location.pathname.split("/").pop();

        const publicPages = ["login.html"];

        if (!user && !publicPages.includes(page)) {
            window.location.replace("login.html");
            return;
        }

        if (user) {
            sessionStorage.setItem("auth", "1");
        }
    });
};

waitAuth();
