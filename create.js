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

/* ======================
   STATE
====================== */
let books = [];
let selectedBook = null;
let qrData = null;

/* ======================
   ELEMENTS
====================== */
const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");

const bookSelect = document.getElementById("bookSelect");
const qrInput = document.getElementById("qrLink");
const colorInput = document.getElementById("qrColor");
const sizeInput = document.getElementById("qrSize");
const logoInput = document.getElementById("logoUpload");

/* ======================
   LOGO
====================== */
let logo = null;

logoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    logo = new Image();
    logo.src = reader.result;
  };
  reader.readAsDataURL(file);
});

/* ======================
   LOAD BOOKS
====================== */
onSnapshot(ref, (snap) => {
  books = snap.data()?.books || [];

  if (bookSelect) {
    bookSelect.innerHTML = "";

    books.forEach(b => {
      bookSelect.innerHTML += `<option value="${b.id}">${b.title}</option>`;
    });
  }
});

/* ======================
   GENERATE QR
====================== */
document.getElementById("generateQR").onclick = async () => {

  const link = qrInput.value;
  if (!link) return;

  qrData = link.startsWith("http") ? link : "https://" + link;

  const size = Number(sizeInput.value);

  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, qrData, {
    width: size,
    color: {
      dark: colorInput.value,
      light: "#ffffff"
    },
    errorCorrectionLevel: "H"
  });

  if (logo) {
    const logoSize = size * 0.2;

    ctx.drawImage(
      logo,
      (size - logoSize) / 2,
      (size - logoSize) / 2,
      logoSize,
      logoSize
    );
  }
};

/* ======================
   SAVE QR (AUTO FIREBASE)
====================== */
document.getElementById("saveQR").onclick = async () => {

  const bookId = Number(bookSelect.value);
  const index = books.findIndex(b => b.id === bookId);

  if (index === -1 || !qrData) return;

  books[index].qrs ??= [];

  books[index].qrs.push({
    id: Date.now(),
    title: "QR",
    description: "",
    content: qrData
  });

  books[index].count = books[index].qrs.length;

  await setDoc(ref, { books });
};

/* ======================
   PNG DOWNLOAD
====================== */
document.getElementById("downloadPNG").onclick = () => {

  const a = document.createElement("a");

  a.download = "QR.png";
  a.href = canvas.toDataURL("image/png");

  a.click();
};

/* ======================
   SVG DOWNLOAD
====================== */
document.getElementById("downloadSVG").onclick = async () => {

  const svg = await QRCode.toString(qrData, {
    type: "svg",
    width: Number(sizeInput.value),
    color: {
      dark: colorInput.value,
      light: "#ffffff"
    },
    errorCorrectionLevel: "H"
  });

  const blob = new Blob([svg], { type: "image/svg+xml" });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "QR.svg";

  a.click();
};
