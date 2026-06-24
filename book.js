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
let logoImage = null;

/* ======================
   ELEMENTS
====================== */
const qrList = document.getElementById("qrList");
const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");

const titleInput = document.getElementById("qrTitle");
const descInput = document.getElementById("qrDesc");
const linkInput = document.getElementById("qrLink");
const colorInput = document.getElementById("qrColor");
const sizeInput = document.getElementById("qrSize");
const logoInput = document.getElementById("qrLogo");

/* ======================
   LOAD LOGO
====================== */
logoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    logoImage = new Image();
    logoImage.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

/* ======================
   FIRESTORE
====================== */
onSnapshot(booksRef, (snap) => {
  const data = snap.data();
  books = data?.books || [];
  currentBook = books.find(b => b.id === bookId);
  if (!currentBook) return;
  render();
});

/* ======================
   RENDER
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
   GENERATE QR (FIXED + LOGO + SIZE)
====================== */
document.getElementById("generateQR").addEventListener("click", async () => {

  const link = linkInput.value;

  if (!link) return;

  lastQR = link.startsWith("http") ? link : "https://" + link;

  const size = parseInt(sizeInput.value);

  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, lastQR, {
    width: size,
    color: {
      dark: colorInput.value,
      light: "#ffffff"
    }
  });

  /* ======================
     LOGO CENTER
  ====================== */
  if (logoImage) {
    const logoSize = size * 0.2;

    ctx.drawImage(
      logoImage,
      (size - logoSize) / 2,
      (size - logoSize) / 2,
      logoSize,
      logoSize
    );
  }
});

/* ======================
   SAVE QR
====================== */
document.getElementById("addQrBtn").addEventListener("click", async () => {

  const title = titleInput.value;
  const desc = descInput.value;

  if (!title || !lastQR) return;

  const index = books.findIndex(b => b.id === bookId);

  books[index].qrs.push({
    id: Date.now(),
    title,
    description: desc,
    content: lastQR
  });

  books[index].count = books[index].qrs.length;

  await setDoc(booksRef, { books });
});

/* ======================
   DELETE
====================== */
window.deleteQR = async function (id) {

  const index = books.findIndex(b => b.id === bookId);

  books[index].qrs = books[index].qrs.filter(q => q.id !== id);

  books[index].count = books[index].qrs.length;

  await setDoc(booksRef, { books });
};

/* ======================
   OPEN
====================== */
window.openQR = function (url) {
  window.open(url, "_blank");
};

/* ======================
   PNG DOWNLOAD (NAME FIX)
====================== */
document.getElementById("downloadPNG").addEventListener("click", () => {

  const fileName = `${currentBook.title}_${titleInput.value}`;

  const a = document.createElement("a");

  a.download = `${fileName}.png`;
  a.href = canvas.toDataURL("image/png");

  a.click();
});

/* ======================
   SVG FIXED
====================== */
document.getElementById("downloadSVG").addEventListener("click", async () => {

  const size = parseInt(sizeInput.value);

  const svg = await QRCode.toString(lastQR, {
    type: "svg",
    width: size,
    color: {
      dark: colorInput.value,
      light: "#ffffff"
    }
  });

  const fileName = `${currentBook.title}_${titleInput.value}`;

  const blob = new Blob([svg], { type: "image/svg+xml" });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.svg`;
  a.click();
});
