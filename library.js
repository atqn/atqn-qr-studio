import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ======================
   FIREBASE CONFIG
====================== */
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ======================
   FIRESTORE REF
====================== */
const booksRef = doc(db, "books", "global");

/* ======================
   STATE
====================== */
let books = [];

/* ======================
   ELEMENTS
====================== */
const booksGrid = document.getElementById("booksGrid");
const addBtn = document.querySelector(".add-book-btn");

/* ======================
   LOAD REALTIME DATA
====================== */
onSnapshot(booksRef, (snap) => {
  const data = snap.data();

  if (!data) {
    books = [];
    render();
    return;
  }

  books = data.books || [];
  render();
});

/* ======================
   RENDER BOOKS
====================== */
function render() {

  if (!booksGrid) return;

  booksGrid.innerHTML = "";

  books.forEach((book) => {

    booksGrid.innerHTML += `
      <div class="book-card">

        <div class="book-icon">${book.icon || "📘"}</div>

        <h3>${book.title}</h3>

        <div class="book-count">
          ${book.count || 0} QR
        </div>

        <button onclick="openBook(${book.id})" class="book-btn">
          فتح الكتاب
        </button>

      </div>
    `;
  });
}

/* ======================
   ADD BOOK
====================== */
async function addBook() {

  const title = prompt("اسم الكتاب:");

  if (!title) return;

  const newBook = {
    id: Date.now(),
    title: title,
    icon: "📘",
    count: 0,
    qrs: []
  };

  books.push(newBook);

  await setDoc(booksRef, { books });
}

/* ======================
   OPEN BOOK
====================== */
window.openBook = function (id) {
  window.location.href = `book.html?id=${id}`;
};

/* ======================
   CLICK ADD BUTTON
====================== */
if (addBtn) {
  addBtn.addEventListener("click", addBook);
}
