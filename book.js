import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
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

const bookId = Number(new URLSearchParams(window.location.search).get("id"));
const booksRef = doc(db, "books", "global");

let books = [];
let currentBook = null;

const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");

let lastQR = "";
let uploadedLogo = null;

/* ======================
   LOGO UPLOAD
====================== */
document.getElementById("logoUpload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        uploadedLogo = new Image();
        uploadedLogo.src = reader.result;
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

    const list = document.getElementById("qrList");
    list.innerHTML = "";

    (currentBook.qrs || []).forEach(qr => {
        list.innerHTML += `
            <div>
                <h3>${qr.title}</h3>
                <p>${qr.description || ""}</p>
                <button onclick="deleteQR(${qr.id})">حذف</button>
            </div>
        `;
    });
}

/* ======================
   SELECT LOGO TYPE
====================== */
document.getElementById("logoType").addEventListener("change", (e) => {
    if (e.target.value === "upload") {
        document.getElementById("logoUpload").click();
    } else {
        uploadedLogo = null;
    }
});

/* ======================
   GENERATE QR (FIXED)
====================== */
document.getElementById("generateQR").addEventListener("click", async () => {

    const link = document.getElementById("qrLink").value;

    if (!link) return;

    lastQR = link.startsWith("http") ? link : "https://" + link;

    const size = Number(document.getElementById("qrSize").value);

    canvas.width = size;
    canvas.height = size;

    await QRCode.toCanvas(canvas, lastQR, {
        width: size,
        color: {
            dark: document.getElementById("qrColor").value,
            light: "#fff"
        }
    });

    // LOGO
    if (uploadedLogo) {
        const logoSize = size * 0.2;

        ctx.drawImage(
            uploadedLogo,
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
document.getElementById("saveQR").addEventListener("click", async () => {

    const title = document.getElementById("qrTitle").value;
    const desc = document.getElementById("qrDesc").value;

    const index = books.findIndex(b => b.id === bookId);

    if (!books[index].qrs) books[index].qrs = [];

    books[index].qrs.push({
        id: Date.now(),
        title,
        description: desc,
        content: lastQR
    });

    await setDoc(booksRef, { books });
});

/* ======================
   DELETE QR
====================== */
window.deleteQR = async function (id) {

    const index = books.findIndex(b => b.id === bookId);

    books[index].qrs = books[index].qrs.filter(q => q.id !== id);

    await setDoc(booksRef, { books });
};

/* ======================
   DELETE BOOK (NEW)
====================== */
document.getElementById("deleteBookBtn").addEventListener("click", async () => {

    const index = books.findIndex(b => b.id === bookId);

    books.splice(index, 1);

    await setDoc(booksRef, { books });

    window.location.href = "library.html";
});
