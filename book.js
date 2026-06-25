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

const titleEl = document.getElementById("bookTitle");
const countEl = document.getElementById("bookCount");

/* ======================
   BOOK ID SAFE PARSE
====================== */
const params = new URLSearchParams(location.search);
const bookId = Number(params.get("id"));

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
   FIRESTORE REALTIME SAFE
====================== */
onSnapshot(booksRef, (snap) => {

  books = snap.data()?.books || [];

  currentBook = books.find(b => b.id === bookId) || null;

  if (!currentBook) {
    if (titleEl) titleEl.innerText = "الكتاب غير موجود";
    if (countEl) countEl.innerText = "0";
    return;
  }

  if (titleEl) titleEl.innerText = currentBook.title;
  if (countEl) countEl.innerText = (currentBook.qrs?.length || 0);

  render();
});

/* ======================
   RENDER LIST SAFE
====================== */
function render() {

  if (!qrList || !currentBook) return;

  qrList.innerHTML = "";

  (currentBook.qrs || []).forEach(qr => {

    qrList.innerHTML += `
      <div class="book-card">
        <h3>${qr.title || ""}</h3>
        <p>${qr.description || ""}</p>

        <button onclick="openQR('${qr.content}')">فتح</button>
        <button onclick="deleteQR(${qr.id})">حذف</button>
      </div>
    `;
  });
}

/* ======================
   GENERATE QR SAFE
====================== */
document.getElementById("generateQR")?.addEventListener("click", async () => {

  const link = qrLink?.value;
  if (!link || !canvas) return;

  lastQR = link.startsWith("http") ? link : "https://" + link;

  const size = Number(qrSize?.value || 300);

  canvas.width = size;
  canvas.height = size;

  try {

    await QRCode.toCanvas(canvas, lastQR, {
      width: size,
      color: {
        dark: qrColor?.value || "#000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "H"
    });

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

  } catch (e) {
    console.error("QR ERROR:", e);
  }
});

/* ======================
   AUTO SAVE (SAFE FIREBASE)
====================== */
document.getElementById("saveQR")?.addEventListener("click", async () => {

  if (!currentBook || !lastQR || !qrTitle?.value) return;

  const index = books.findIndex(b => b.id === bookId);
  if (index === -1) return;

  books[index].qrs ??= [];

  books[index].qrs.push({
    id: Date.now(),
    title: qrTitle.value,
    description: qrDesc?.value || "",
    content: lastQR
  });

  books[index].count = books[index].qrs.length;

  await setDoc(booksRef, { books });
});

/* ======================
   DELETE QR SAFE
====================== */
window.deleteQR = async function (id) {

  const index = books.findIndex(b => b.id === bookId);
  if (index === -1) return;

  books[index].qrs = (books[index].qrs || []).filter(q => q.id !== id);

  books[index].count = books[index].qrs.length;

  await setDoc(booksRef, { books });
};

/* ======================
   OPEN QR SAFE
====================== */
window.openQR = function (url) {
  if (!url) return;
  window.open(url, "_blank");
};

/* ======================
   PNG DOWNLOAD SAFE
====================== */
document.getElementById("downloadPNG")?.addEventListener("click", () => {

  if (!canvas) return;

  const bookName = currentBook?.title || "book";
  const qrName = qrTitle?.value || "qr";

  const a = document.createElement("a");
  a.download = `${bookName}_${qrName}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
});

/* ======================
   SVG DOWNLOAD SAFE
====================== */
document.getElementById("downloadSVG")?.addEventListener("click", async () => {

  if (!lastQR) return;

  const size = Number(qrSize?.value || 300);

  const svg = await QRCode.toString(lastQR, {
    type: "svg",
    width: size,
    color: {
      dark: qrColor?.value || "#000",
      light: "#ffffff"
    },
    errorCorrectionLevel: "H"
  });

  const blob = new Blob([svg], { type: "image/svg+xml" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${currentBook?.title || "book"}_${qrTitle?.value || "qr"}.svg`;
  a.click();
};
