import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

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
const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");

const qrTitle = document.getElementById("qrTitle");
const qrDesc = document.getElementById("qrDesc");
const qrLink = document.getElementById("qrLink");
const qrColor = document.getElementById("qrColor");
const qrSize = document.getElementById("qrSize");
const qrList = document.getElementById("qrList");

/* ======================
   LOGO UPLOAD
====================== */
document.getElementById("logoUpload")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    logoImage = new Image();
    logoImage.src = reader.result;
  };
  reader.readAsDataURL(file);
});

/* ======================
   FIRESTORE REALTIME
====================== */
onSnapshot(booksRef, (snap) => {
  books = snap.data()?.books || [];
  currentBook = books.find(b => b.id == new URLSearchParams(location.search).get("id"));

  if (!currentBook) return;

  document.getElementById("bookTitle").innerText = currentBook.title;
  document.getElementById("bookCount").innerText = (currentBook.qrs?.length || 0);

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
   GENERATE QR
====================== */
document.getElementById("generateQR").addEventListener("click", async () => {

  const link = qrLink.value;
  if (!link) return;

  lastQR = link.startsWith("http") ? link : "https://" + link;

  const size = Number(qrSize.value);

  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, lastQR, {
    width: size,
    color: {
      dark: qrColor.value,
      light: "#ffffff"
    },
    errorCorrectionLevel: "H"
  });

  /* ======================
     LOGO CENTER
  ====================== */
  if (logoImage) {
    const logoSize = size * 0.22;

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
   AUTO SAVE QR
====================== */
document.getElementById("saveQR").addEventListener("click", async () => {

  if (!lastQR || !qrTitle.value) return;

  const index = books.findIndex(b => b.id == currentBook.id);

  books[index].qrs ??= [];

  books[index].qrs.push({
    id: Date.now(),
    title: qrTitle.value,
    description: qrDesc.value,
    content: lastQR
  });

  books[index].count = books[index].qrs.length;

  await setDoc(booksRef, { books });
});

/* ======================
   DELETE QR
====================== */
window.deleteQR = async function (id) {

  const index = books.findIndex(b => b.id == currentBook.id);

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

  const bookName = currentBook?.title || "book";
  const qrName = qrTitle.value || "qr";

  const a = document.createElement("a");
  a.download = `${bookName}_${qrName}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
});

/* ======================
   DOWNLOAD SVG
====================== */
document.getElementById("downloadSVG").addEventListener("click", async () => {

  const size = Number(qrSize.value);

  const svg = await QRCode.toString(lastQR, {
    type: "svg",
    width: size,
    color: {
      dark: qrColor.value,
      light: "#ffffff"
    },
    errorCorrectionLevel: "H"
  });

  const blob = new Blob([svg], { type: "image/svg+xml" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${currentBook.title}_${qrTitle.value}.svg`;
  a.click();
});
