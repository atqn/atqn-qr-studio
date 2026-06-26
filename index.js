import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

/* ======================
   CACHE
====================== */
let cachedBooks = null;

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
    const booksCount = document.getElementById("booksCount");
    const qrsCount = document.getElementById("qrsCount");

    const totalBooks = books.length;

    const totalQrs = books.reduce((sum, book) => {
        return sum + ((book.qrs || []).length);
    }, 0);

    requestAnimationFrame(() => {
        booksCount.textContent = totalBooks;
        qrsCount.textContent = totalQrs;
    });
}

/* ======================
   INIT FAST LOAD
====================== */
booksCount.textContent = "0";
qrsCount.textContent = "0";

/* ======================
   DB
====================== */
ensureDatabase();

onSnapshot(booksRef, (snap) => {
    const books = snap.data()?.books || [];

    cachedBooks = books;

    requestAnimationFrame(() => {
        updateDashboard(books);
    });
});
