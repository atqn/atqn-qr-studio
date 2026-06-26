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

  const id = Number(bookSelect.value);

  if (!id && books.length > 0) {
    bookSelect.value = books[0].id;
  }

  loadBook();

  // 🔥 مهم جدًا: تشغيل التوليد بعد تحميل البيانات
  setTimeout(() => {
    generateQR();
  }, 50);
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

  // 🔥 تحديث العنوان والعدد
  document.getElementById("bookTitle").innerText = currentBook.title;
  document.getElementById("bookCount").innerText = currentBook.qrs?.length || 0;

  renderQRs();

  // 🔥 أهم سطر لحل المشكلة
  setTimeout(() => {
    generateQR();
  }, 50);
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

  if (!value) {
    preview.innerHTML = "أدخل رابط أو محتوى QR";
    return;
  }

  preview.innerHTML = "";

  try {

    const qr = new QRCodeStyling({
      width: Number(size.value || 600),
      height: Number(size.value || 600),
      data: value,
      image: "assets/atqn-logo.png",
      dotsOptions: {
        color: color.value || "#000",
        type: "square"
      },
      backgroundOptions: {
        color: "#ffffff"
      }
    });

    qr.append(preview);

    qrInstance = qr;

  } catch (e) {
    console.log("QR ERROR:", e);
  }
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

window.addEventListener("load", () => {
  setTimeout(() => {
    if (bookSelect.value) {
      loadBook();
      generateQR();
    }
  }, 100);
});
