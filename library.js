import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

let books = [];
let cachedBooks = null;

const booksGrid = document.getElementById("booksGrid");
const addBookBtn = document.getElementById("addBookBtn");

async function ensureDatabase() {
    const snap = await getDoc(booksRef);

    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

function render() {
    booksGrid.innerHTML = "";

    if (!books.length) {
        booksGrid.innerHTML = `
            <div class="book-card">
                <h3>لا توجد كتب</h3>
            </div>
        `;
        return;
    }

    books.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";

        card.innerHTML = `
            <h3>${book.title}</h3>
            <div>${(book.qrs || []).length} QR</div>
            <button class="open-book">فتح الكتاب</button>
        `;

        card.querySelector(".open-book").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `book.html?id=${book.id}`;
        });

        booksGrid.appendChild(card);
    });
}

/* ======================
   FAST INIT
====================== */
ensureDatabase();

onSnapshot(booksRef, (snap) => {
    cachedBooks = snap.data()?.books || [];

    requestAnimationFrame(() => {
        books = cachedBooks;
        render();
    });
});
