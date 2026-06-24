import { initApp, saveBooks } from "./app.js";

const params = new URLSearchParams(location.search);

const bookId = Number(params.get("book"));
const qrId = Number(params.get("qr"));

let booksState = [];
let currentBook = null;
let currentQR = null;

let qr = null;

/* ======================
   INIT APP (REALTIME)
====================== */
initApp((books) => {

    booksState = books;

    currentBook = booksState.find(b => b.id === bookId);

    if (!currentBook) return;

    currentQR = currentBook.qrs.find(q => q.id === qrId);

    fillForm();
    generateQR();
});

/* ======================
   FILL FORM
====================== */
function fillForm() {

    if (!currentBook) return;

    document.getElementById("bookNameInput").value = currentBook.title;

    if (!currentQR) return;

    document.getElementById("qrTitleInput").value = currentQR.title;
    document.getElementById("qrDescriptionInput").value = currentQR.description;
    document.getElementById("qrContentInput").value = currentQR.content;
}

/* ======================
   GENERATE QR
====================== */
function generateQR() {

    const content = document.getElementById("qrContentInput").value;

    if (!content) return;

    const size = Number(document.getElementById("qrSizeInput").value);

    document.getElementById("qrPreviewBox").innerHTML = "";

    qr = new QRCodeStyling({
        width: size,
        height: size,
        data: content,
        dotsOptions: {
            color: document.getElementById("qrColorInput").value,
            type: document.getElementById("qrStyleInput").value
        },
        image: "",
        backgroundOptions: {
            color: "#fff"
        }
    });

    qr.append(document.getElementById("qrPreviewBox"));
}

/* ======================
   EVENTS
====================== */
document.getElementById("generatePreviewBtn").onclick = generateQR;

/* ======================
   LIVE UPDATE
====================== */
document.getElementById("qrContentInput").addEventListener("input", generateQR);

/* ======================
   SAVE QR
====================== */
document.getElementById("saveQrChangesBtn").onclick = async () => {

    const book = booksState.find(b => b.id === bookId);

    if (!book) return;

    const title = document.getElementById("qrTitleInput").value;
    const desc = document.getElementById("qrDescriptionInput").value;
    const content = document.getElementById("qrContentInput").value;

    if (!title || !content) return;

    const index = book.qrs.findIndex(q => q.id === qrId);

    const qrData = {
        id: qrId || Date.now(),
        title,
        description: desc,
        content
    };

    if (index >= 0) {
        book.qrs[index] = qrData;
    } else {
        book.qrs.push(qrData);
    }

    book.count = book.qrs.length;

    await saveBooks(booksState);

    alert("تم الحفظ بنجاح ✅");
};

/* ======================
   DOWNLOAD PNG
====================== */
document.getElementById("downloadQrBtn").onclick = () => {
    if (qr) qr.download({ extension: "png" });
};

/* ======================
   DOWNLOAD SVG
====================== */
document.getElementById("downloadSvgBtn").onclick = () => {
    if (qr) qr.download({ extension: "svg" });
};
