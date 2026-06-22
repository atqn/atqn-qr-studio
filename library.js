let deleteBookId = null;

const db = window.db;
const { doc, setDoc, onSnapshot } = window.firebaseFirestore;

/* ======================
   REALTIME FIREBASE LOAD
====================== */

function listenBooks() {
    const ref = doc(db, "app", "books");

    onSnapshot(ref, (snap) => {
        const data = snap.data();

        const books = data?.items || [];

        renderBooks(books);
    });
}

/* ======================
   RENDER
====================== */

function renderBooks(books = []) {

    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    grid.innerHTML = "";

    books.forEach(book => {

        grid.innerHTML += `
<div class="book-card">

    <div class="book-icon">${book.icon}</div>

    <h3>${book.title}</h3>

    <div class="book-count">${book.count} QR</div>

    <button onclick="openBook(${book.id})">📖 فتح</button>

</div>
`;
    });
}

/* ======================
   INIT
====================== */

document.addEventListener("DOMContentLoaded", () => {
    listenBooks();
});

/* ======================
   NAV
====================== */

function openBook(id) {
    window.location.href = "book.html?id=" + id;
}
