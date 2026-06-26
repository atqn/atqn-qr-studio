if (!document.body) {
    throw new Error("Page not ready");
}

if (!document.getElementById("booksCount")) return;

import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

/* ======================
   SAFE RENDER SYSTEM
====================== */
let isRendering = false;

function safeRender(callback) {
    if (isRendering) return;

    isRendering = true;

    requestAnimationFrame(() => {
        callback();
        isRendering = false;
    });
}

async function ensureDatabase() {
    const snap = await getDoc(booksRef);

    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

function updateDashboard(books) {
    const booksCount = document.getElementById("booksCount");
    const qrsCount = document.getElementById("qrsCount");

    const totalBooks = books.length;

    const totalQrs = books.reduce((sum, book) => {
        return sum + ((book.qrs || []).length);
    }, 0);

    booksCount.textContent = totalBooks;
    qrsCount.textContent = totalQrs;
}

ensureDatabase();

onSnapshot(booksRef, (snap) => {
    const data = snap.data();
    const books = data?.books || [];

    safeRender(() => {
        updateDashboard(books);
    });
});
