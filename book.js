import { initApp, saveBooks } from "./app.js";

const params = new URLSearchParams(location.search);
const bookId = Number(params.get("id"));

let booksState = [];
let currentBook = null;

/* ======================
   INIT REALTIME APP
====================== */
initApp((books) => {

    booksState = books;

    currentBook = booksState.find(b => b.id === bookId);

    if (!currentBook) return;

    render();
});

/* ======================
   RENDER UI
====================== */
function render() {

    document.getElementById("bookTitle").innerText = currentBook.title;
    document.getElementById("bookCount").innerText = currentBook.qrs.length + " QR";

    const list = document.getElementById("qrList");
    list.innerHTML = "";

    currentBook.qrs.forEach(qr => {

        list.innerHTML += `
        <div class="book-card">

            <h3>${qr.title}</h3>
            <p>${qr.description}</p>

            <button onclick="openQR(${qr.id})">فتح</button>
            <button onclick="deleteQR(${qr.id})">حذف</button>

        </div>
        `;
    });
}

/* ======================
   OPEN QR
====================== */
window.openQR = function (id) {
    alert("فتح QR: " + id);
};

/* ======================
   DELETE QR
====================== */
window.deleteQR = async function (id) {

    const book = booksState.find(b => b.id === bookId);

    book.qrs = book.qrs.filter(q => q.id !== id);
    book.count = book.qrs.length;

    await saveBooks(booksState);
};

/* ======================
   ADD QR MODAL
====================== */
const modal = document.getElementById("qrModal");

document.getElementById("addQrBtn").onclick = () => {
    modal.style.display = "flex";
};

document.getElementById("cancelQrBtn").onclick = () => {
    modal.style.display = "none";
};

document.getElementById("saveQrBtn").onclick = async () => {

    const title = document.getElementById("qrTitle").value.trim();
    const desc = document.getElementById("qrDesc").value.trim();
    const content = document.getElementById("qrContent").value.trim();

    if (!title || !content) return;

    const book = booksState.find(b => b.id === bookId);

    book.qrs.push({
        id: Date.now(),
        title,
        description: desc,
        content
    });

    book.count = book.qrs.length;

    await saveBooks(booksState);

    modal.style.display = "none";
};
