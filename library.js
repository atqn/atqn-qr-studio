import { initApp, saveBooks, addBook, deleteBook } from "./app.js";

let booksState = [];

/* ======================
   INIT APP (REALTIME)
====================== */
initApp((books) => {

    booksState = books;
    render();
});

/* ======================
   RENDER UI
====================== */
function render() {

    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    grid.innerHTML = "";

    booksState.forEach(book => {

        grid.innerHTML += `
        <div class="book-card">

            <div class="book-icon">${book.icon}</div>

            <h3>${book.title}</h3>

            <div>${book.count} QR</div>

            <button onclick="openBook(${book.id})">فتح</button>

            <button onclick="removeBook(${book.id})">حذف</button>

        </div>
        `;
    });
}

/* ======================
   OPEN BOOK
====================== */
window.openBook = function (id) {
    window.location.href = "book.html?id=" + id;
};

/* ======================
   DELETE BOOK
====================== */
window.removeBook = async function (id) {

    booksState = deleteBook(booksState, id);

    await saveBooks(booksState);
};

/* ======================
   ADD BOOK UI
====================== */
const modal = document.getElementById("modal");

document.getElementById("addBookBtn").onclick = () => {
    modal.style.display = "flex";
};

document.getElementById("cancelBtn").onclick = () => {
    modal.style.display = "none";
};

document.getElementById("saveBtn").onclick = async () => {

    const title = document.getElementById("bookTitleInput").value.trim();
    if (!title) return;

    booksState = addBook(booksState, title);

    await saveBooks(booksState);

    modal.style.display = "none";
};
