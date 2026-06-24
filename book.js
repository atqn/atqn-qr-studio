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
const bookId = Number(new URLSearchParams(location.search).get("id"));
const booksRef = doc(db, "books", "global");

/* ======================
   STATE
====================== */
let books = [];
let currentBook = null;
let lastQR = "";
let logoImg = null;

/* ======================
   ELEMENTS (SAFE)
====================== */
const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");

const qrTitle = document.getElementById("qrTitle");
const qrDesc = document.getElementById("qrDesc");
const qrLink = document.getElementById("qrLink");
const qrColor = document.getElementById("qrColor");
const qrSize = document.getElementById("qrSize");
const qrList = document.getElementById("qrList");

/* ======================
   LOGO (OPTIONAL)
====================== */
document.getElementById("logoUpload")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    logoImg = new Image();
    logoImg.src = reader.result;
  };
  reader.readAsDataURL(file);
});

/* ======================
   FIRESTORE
====================== */
onSnapshot(booksRef, (snap) => {
  books = snap.data()?.books || [];
  currentBook = books.find(b => b.id === bookId);

  if (!currentBook) return;

  document.getElementById("bookTitle").innerText = currentBook.title;
  document.getElementById("bookCount").innerText = currentBook.qrs?.length || 0;

  render();
});

/* ======================
   RENDER LIST
====================== */
function render() {
  qrList.innerHTML = "";

  (currentBook?.qrs || []).forEach(qr => {
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
   GENERATE QR (FIXED)
====================== */
document.getElementById("generateQR").onclick = async () => {

  if (!qrLink.value) return;

  lastQR = qrLink.value.startsWith("http")
    ? qrLink.value
    : "https://" + qrLink.value;

  const size = Number(qrSize.value);

  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, lastQR, {
    width: size,
    color: {
      dark: qrColor.value,
      light: "#fff"
    },
    errorCorrectionLevel: "H"
  });

  if (logoImg) {
    const s = size * 0.22;
    ctx.drawImage(logoImg, (size - s) / 2, (size - s) / 2, s, s);
  }
};

/* ======================
   SAVE QR
====================== */
document.getElementById("addQrBtn").onclick = async () => {

  if (!qrTitle.value || !lastQR) return;

  const i = books.findIndex(b => b.id === bookId);

  books[i].qrs ??= [];

  books[i].qrs.push({
    id: Date.now(),
    title: qrTitle.value,
    description: qrDesc.value,
    content: lastQR
  });

  await setDoc(booksRef, { books });
};

/* ======================
   DELETE QR
====================== */
window.deleteQR = async (id) => {

  const i = books.findIndex(b => b.id === bookId);

  books[i].qrs = books[i].qrs.filter(q => q.id !== id);

  await setDoc(booksRef, { books });
};

/* ======================
   OPEN
====================== */
window.openQR = (url) => {
  if (url) window.open(url, "_blank");
};

/* ======================
   PNG
====================== */
document.getElementById("downloadPNG").onclick = () => {

  const name = `${document.getElementById("bookTitle").innerText}_${qrTitle.value}`;

  const a = document.createElement("a");
  a.download = name + ".png";
  a.href = canvas.toDataURL("image/png");
  a.click();
};

/* ======================
   SVG
====================== */
document.getElementById("downloadSVG").onclick = async () => {

  const svg = await QRCode.toString(lastQR, {
    type: "svg",
    width: Number(qrSize.value),
    color: {
      dark: qrColor.value,
      light: "#fff"
    },
    errorCorrectionLevel: "H"
  });

  const name = `${document.getElementById("bookTitle").innerText}_${qrTitle.value}`;

  const blob = new Blob([svg], { type: "image/svg+xml" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name + ".svg";
  a.click();
};
