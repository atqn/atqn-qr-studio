import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase.js";

/* ======================
   GET BOOK ID
====================== */
const params = new URLSearchParams(window.location.search);
const bookId = Number(params.get("id"));

const booksRef = doc(db, "books", "global");

/* ======================
   STATE
====================== */
let books = [];
let currentBook = null;

/* ======================
   ELEMENTS
====================== */
const qrList = document.getElementById("qrList");
const addBtn = document.getElementById("addQrBtn");
const titleEl = document.getElementById("bookTitle");
const countEl = document.getElementById("bookCount");

/* ======================
   REALTIME
====================== */
onSnapshot(booksRef, (snap) => {

    const data = snap.data();

    books = data?.books || [];

    currentBook = books.find(b => b.id === bookId);

    if (!currentBook) return;

    render();
});

/* ======================
   RENDER QRs
====================== */
function render() {

    if (!currentBook) return;

    titleEl.textContent = currentBook.title;
    countEl.textContent = currentBook.qrs.length + " QR";

    qrList.innerHTML = "";

    currentBook.qrs.forEach(qr => {

        qrList.innerHTML += `
            <div class="book-card">

                <h3>${qr.title}</h3>

                <p>${qr.description || ""}</p>

                <button onclick="openQR('${qr.content}')">فتح</button>
                <button onclick="deleteQR(${qr.id})">حذف</button>

            </div>
        `;
    });
}

/* ======================
   ADD QR
====================== */
async function addQR() {

    const title = prompt("عنوان QR");
    const link = prompt("الرابط");

    if (!title || !link) return;

    const index = books.findIndex(b => b.id === bookId);

    if (!books[index].qrs) books[index].qrs = [];

    books[index].qrs.push({
        id: Date.now(),
        title,
        content: link
    });

    books[index].count = books[index].qrs.length;

    await setDoc(booksRef, { books });
}

/* ======================
   DELETE QR
====================== */
window.deleteQR = async function (id) {

    const index = books.findIndex(b => b.id === bookId);

    books[index].qrs = books[index].qrs.filter(q => q.id !== id);

    books[index].count = books[index].qrs.length;

    await setDoc(booksRef, { books });
};

/* ======================
   OPEN QR
====================== */
window.openQR = function (url) {
    window.open(url, "_blank");
};

/* ======================
   EVENT
====================== */
if (addBtn) {
    addBtn.addEventListener("click", addQR);
}
