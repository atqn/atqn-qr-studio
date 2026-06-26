import {
  booksRef,
  setDoc,
  onSnapshot
} from "./firebase.js";

/* ======================
   STATE
====================== */

let books = [];
let currentBook = null;
let currentQR = null;
let qrInstance = null;
let uploadedLogo = null;

/* ======================
   ELEMENTS
====================== */

const bookSelect = document.getElementById("bookSelect");

const title = document.getElementById("qrTitle");
const desc = document.getElementById("qrDesc");
const link = document.getElementById("qrContentInput");

const color = document.getElementById("qrColorInput");
const size = document.getElementById("qrSizeInput");

const preview = document.getElementById("qrPreviewBox");
const logoInput = document.getElementById("qrLogoInput");

/* ======================
   LOAD BOOKS
====================== */

onSnapshot(booksRef, (snap) => {
  books = snap.data()?.books || [];

  renderBooks();
  loadBook();
});

/* ======================
   BOOK SELECT
====================== */

function renderBooks() {
  bookSelect.innerHTML = "";

  books.forEach(b => {
    bookSelect.innerHTML += `
      <option value="${b.id}">${b.title}</option>
    `;
  });
}

bookSelect.addEventListener("change", () => {
  loadBook();
});

/* ======================
   LOAD CURRENT BOOK
====================== */

function loadBook() {
  const id = Number(bookSelect.value);

  currentBook = books.find(b => b.id === id);

  if (!currentBook) return;

  // أهم سطر (حل مشكلة عدم ظهور البيانات)
  renderQRs();
  generateQR();
}

/* ======================
   RENDER QRS
====================== */

function renderQRs() {
  const list = document.getElementById("qrList");

  list.innerHTML = "";

  (currentBook?.qrs || []).forEach(qr => {
    list.innerHTML += `
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

function generateQR() {
  const value = link.value;

  if (!value) return;

  preview.innerHTML = "";

  const qr = new QRCodeStyling({
    width: Number(size.value),
    height: Number(size.value),
    data: value,
    image: uploadedLogo || "assets/atqn-logo.png",
    dotsOptions: {
      color: color.value,
      type: "square"
    },
    backgroundOptions: {
      color: "#fff"
    }
  });

  qr.append(preview);
  qrInstance = qr;
}

/* ======================
   AUTO GENERATE (بديل زر)
====================== */

[title, desc, link, color, size].forEach(el => {
  el.addEventListener("input", generateQR);
});

/* ======================
   SAVE QR
====================== */

document.getElementById("saveQR").onclick = async () => {
  if (!currentBook) return;

  const qr = {
    id: Date.now(),
    title: title.value,
    description: desc.value,
    content: link.value
  };

  currentBook.qrs = currentBook.qrs || [];
  currentBook.qrs.push(qr);

  await setDoc(booksRef, { books });

  renderQRs();
};

/* ======================
   DELETE QR
====================== */

window.deleteQR = async (id) => {
  currentBook.qrs = currentBook.qrs.filter(q => q.id !== id);
  await setDoc(booksRef, { books });
  renderQRs();
};

/* ======================
   OPEN QR
====================== */

window.openQR = (url) => {
  window.open(url, "_blank");
};

/* ======================
   PNG DOWNLOAD
====================== */

document.getElementById("downloadPNG").onclick = () => {
  if (!qrInstance) return;

  qrInstance.download({
    extension: "png",
    name: "QR"
  });
};

/* ======================
   SVG DOWNLOAD
====================== */

document.getElementById("downloadSVG").onclick = () => {
  if (!qrInstance) return;

  qrInstance.download({
    extension: "svg",
    name: "QR"
  });
};
