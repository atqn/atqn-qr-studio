import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

const CACHE_KEY = "atqn_book_cache";

const params = new URLSearchParams(window.location.search);
const bookId = Number(params.get("id"));

let books = [];
let currentBook = null;

/* ======================
   CACHE LOAD
====================== */
function loadCache() {

    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
        try {
            const data = JSON.parse(cached);
            books = data.books || [];
            currentBook = books.find(b => b.id === bookId);

            render();
        } catch (e) {}
    }
}

function saveCache() {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ books }));
}

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

function getCurrentBook() {
    return books.find(b => b.id === bookId);
}

/* ======================
   RENDER
====================== */
function render() {

    if (!currentBook) return;

    document.getElementById("bookTitle").textContent = currentBook.title;
    document.getElementById("bookCount").textContent =
        (currentBook.qrs || []).length;

    const qrList = document.getElementById("qrList");

    qrList.innerHTML = "";

    (currentBook.qrs || []).forEach(qr => {

        qrList.innerHTML += `
            <div class="book-card">
                <h3>${qr.title}</h3>
                <p>${qr.description || ""}</p>
                <button onclick="openQR('${qr.content}')">فتح</button>
            </div>
        `;
    });
}

/* ======================
   REALTIME
====================== */
ensureDatabase();

onSnapshot(booksRef, (snap) => {

    const data = snap.data();
    books = data?.books || [];

    currentBook = getCurrentBook();

    render();
    saveCache();
});

/* ======================
   GLOBALS
====================== */
window.openQR = function (url) {
    window.open(url, "_blank");
};
