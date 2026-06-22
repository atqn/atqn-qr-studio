const db = window.db;
const fs = window.firebaseFirestore || {};
const { doc, onSnapshot } = fs;

const bookRef = doc(db, "books", "app");

function renderBooks(books) {

    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    grid.innerHTML = "";

    books.forEach(book => {

        grid.innerHTML += `
        <div class="book-card">

            <div class="book-icon">${book.icon}</div>

            <h3>${book.title}</h3>

            <div class="book-count">${book.count} QR</div>

            <button onclick="openBook(${book.id})">فتح</button>

        </div>`;
    });
}

/* REALTIME LISTENER */

onSnapshot(bookRef, (snap) => {

    if (!snap.exists()) return;

    const books = snap.data().items || [];

    renderBooks(books);

});

function openBook(id) {
    window.location.href = "book.html?id=" + id;
}
