import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const ref = doc(db, "books", "global");

let books = [];

/* ======================
   REAL DATA ENGINE
====================== */
onSnapshot(ref, (snap) => {

  const data = snap.data();
  books = data?.books || [];

  renderDashboard();
});

/* ======================
   CALCULATIONS (FIXED)
====================== */
function getTotalBooks() {
  return books.length;
}

function getTotalQRs() {
  return books.reduce((sum, b) => sum + (b.qrs?.length || 0), 0);
}

/* ======================
   RENDER DASHBOARD
====================== */
function renderDashboard() {

  const booksCount = document.getElementById("booksCount");
  const qrCount = document.getElementById("qrCount");

  if (booksCount) booksCount.innerText = getTotalBooks();
  if (qrCount) qrCount.innerText = getTotalQRs();

  const grid = document.getElementById("booksGrid");
  if (!grid) return;

  grid.innerHTML = "";

  books.forEach((b) => {

    const qrLength = b.qrs ? b.qrs.length : 0;

    grid.innerHTML += `
      <div class="book-card">

        <div class="book-icon">${b.icon || "📘"}</div>

        <h3>${b.title}</h3>

        <div class="book-count">
          QR ${qrLength}
        </div>

        <button onclick="openBook(${b.id})">
          فتح الكتاب
        </button>

      </div>
    `;
  });
}

/* ======================
   OPEN BOOK
====================== */
window.openBook = function (id) {
  location.href = `book.html?id=${id}`;
};
