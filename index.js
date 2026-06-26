import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

/* ======================
   CACHE KEY
====================== */
const CACHE_KEY = "atqn_dashboard_cache";

/* ======================
   ELEMENTS
====================== */
const booksCount = document.getElementById("booksCount");
const qrsCount = document.getElementById("qrsCount");

/* ======================
   LOAD CACHE INSTANTLY
====================== */
function loadCache() {
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
        try {
            const books = JSON.parse(cached);
            updateDashboard(books);
        } catch (e) {}
    }
}

function saveCache(books) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(books));
}

/* ======================
   INIT UI (instant)
====================== */
booksCount.textContent = "0";
qrsCount.textContent = "0";

loadCache();

/* ======================
   DB INIT
====================== */
async function ensureDatabase() {
    const snap = await getDoc(booksRef);

    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

/* ======================
   UPDATE DASHBOARD
====================== */
function updateDashboard(books) {

    const totalBooks = books.length;

    const totalQrs = books.reduce((sum, book) => {
        return sum + ((book.qrs || []).length);
    }, 0);

    requestAnimationFrame(() => {
        booksCount.textContent = totalBooks;
        qrsCount.textContent = totalQrs;
    });

    saveCache(books);
}

/* ======================
   REALTIME FIREBASE
====================== */
ensureDatabase();

onSnapshot(booksRef, (snap) => {

    const data = snap.data();
    const books = data?.books || [];

    updateDashboard(books);
});
