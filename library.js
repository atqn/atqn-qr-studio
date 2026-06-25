import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ======================
   FIREBASE
====================== */
const firebaseConfig = {
  apiKey: "AIzaSyBmgkN6Glpa0ly_d4e8heB0TiCmV6ieKbw",
  authDomain: "atqn-qr1.firebaseapp.com",
  projectId: "atqn-qr1",
  storageBucket: "atqn-qr1.firebasestorage.app",
  messagingSenderId: "867770918097",
  appId: "1:867770918097:web:419b4dc7fefe9e1c4d51f0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const booksRef = doc(db, "books", "global");

/* ======================
   STATE
====================== */
let books = [];
let deleteId = null;

/* ======================
   INIT FIRESTORE
====================== */
async function init() {
  const snap = await getDoc(booksRef);

  if (!snap.exists()) {
    await setDoc(booksRef, { books: [] });
  }
}
init();

/* ======================
   REALTIME LISTENER
====================== */
onSnapshot(booksRef, (snap) => {
  const data = snap.data();
  books = data?.books || [];
  render();
});

/* ======================
   RENDER
====================== */
function render() {
  const grid = document.getElementById("booksGrid");
  if (!grid) return;

  grid.innerHTML = "";

  books.forEach((b) => {
    grid.innerHTML += `
      <div class="book-card">
        <div class="book-icon">${b.icon || "📘"}</div>
        <h3>${b.title}</h3>
        <div class="book-count">${b.count || 0} QR</div>

        <div class="book-actions">
          <button class="action-btn edit-btn" onclick="editBook(${b.id})">تعديل</button>
          <button class="action-btn delete-btn" onclick="openDelete(${b.id})">حذف</button>
        </div>

        <button class="book-btn" onclick="openBook(${b.id})">
          فتح الكتاب
        </button>
      </div>
    `;
  });
}

/* ======================
   ADD BOOK
====================== */
window.addBook = async function () {
  const title = prompt("اسم الكتاب");
  if (!title) return;

  const newBook = {
    id: Date.now(),
    title,
    icon: "📘",
    count: 0,
    qrs: []
  };

  books.push(newBook);
  await setDoc(booksRef, { books });
};

/* ======================
   DELETE BOOK
====================== */
window.openDelete = function (id) {
  deleteId = id;
  document.getElementById("deleteModal")?.classList.add("show");
};

window.confirmDelete = async function () {
  books = books.filter(b => b.id !== deleteId);
  await setDoc(booksRef, { books });
  document.getElementById("deleteModal")?.classList.remove("show");
};

window.cancelDelete = function () {
  document.getElementById("deleteModal")?.classList.remove("show");
  deleteId = null;
};

/* ======================
   OPEN BOOK
====================== */
window.openBook = function (id) {
  window.location.href = `book.html?id=${id}`;
};

/* ======================
   EDIT BOOK
====================== */
window.editBook = async function (id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  const newTitle = prompt("تعديل الاسم", book.title);
  if (!newTitle) return;

  book.title = newTitle;
  await setDoc(booksRef, { books });
};

/* ======================
   BUTTON EVENT
====================== */
document.querySelector(".add-book-btn")
?.addEventListener("click", addBook);
