import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
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

/* ======================
   BOOK ID
====================== */
const params = new URLSearchParams(window.location.search);
const bookId = Number(params.get("id"));

const booksRef = doc(db, "books", "global");

/* ======================
   STATE
====================== */
let books = [];
let currentBook = null;
let lastQR = "";

/* ======================
   ELEMENTS
====================== */
const qrList = document.getElementById("qrList");
const canvas = document.getElementById("qrCanvas");

const titleInput = document.getElementById("qrTitle");
const descInput = document.getElementById("qrDesc");
const linkInput = document.getElementById("qrLink");
const colorInput = document.getElementById("qrColor");
const sizeInput = document.getElementById("qrSize");

/* ======================
   FIRESTORE LISTENER
====================== */
onSnapshot(booksRef, (snap) => {

  const data = snap.data();

  books = data?.books || [];

  currentBook = books.find(b => b.id === bookId);

  if (!currentBook) return;

  render();
});

/* ======================
   RENDER QR LIST
====================== */
function render() {

  qrList.innerHTML = "";

  (currentBook.qrs || []).forEach(qr => {

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
   GENERATE QR
====================== */
document.getElementById("generateQR").addEventListener("click", async () => {

  const title = titleInput.value;
  const desc = descInput.value;
  const link = linkInput.value;

  if (!title || !link) return;

  lastQR = link.startsWith("http") ? link : "https://" + link;

  await QRCode.toCanvas(canvas, lastQR, {
    width: parseInt(sizeInput.value),
    color: {
      dark: colorInput.value,
      light: "#ffffff"
    }
  });
});

/* ======================
   SAVE QR
====================== */
document.getElementById("addQrBtn").addEventListener("click", async () => {

  const title = titleInput.value;
  const desc = descInput.value;
  const link = lastQR;

  if (!title || !link) return;

  const index = books.findIndex(b => b.id === bookId);

  if (!books[index].qrs) books[index].qrs = [];

  books[index].qrs.push({
    id: Date.now(),
    title,
    description: desc,
    content: link
  });

  books[index].count = books[index].qrs.length;

  await setDoc(booksRef, { books });
});

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
   DOWNLOAD PNG
====================== */
document.getElementById("downloadPNG").addEventListener("click", () => {

  const link = document.createElement("a");

  link.download = `QR_${currentBook.title}.png`;

  link.href = canvas.toDataURL("image/png");

  link.click();
});

/* ======================
   DOWNLOAD SVG
====================== */
document.getElementById("downloadSVG").addEventListener("click", async () => {

  const svg = await QRCode.toString(lastQR, {
    type: "svg",
    width: parseInt(sizeInput.value),
    color: {
      dark: colorInput.value,
      light: "#ffffff"
    }
  });

  const blob = new Blob([svg], { type: "image/svg+xml" });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download = `QR_${currentBook.title}.svg`;

  a.click();
});
