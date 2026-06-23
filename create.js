document.addEventListener("DOMContentLoaded", function () {

const db = window.db;
const firestore = window.firebaseFirestore || {};
const { doc, setDoc, onSnapshot } = firestore;

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;

    toast.className = "toast";
    void toast.offsetWidth;

    toast.classList.add("show", type);

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* ======================
   PARAMS
====================== */

const params = new URLSearchParams(window.location.search);

const bookId = Number(params.get("book"));
const qrId = Number(params.get("qr"));

const qrPreviewBox = document.getElementById("qrPreviewBox");
const generateBtn = document.getElementById("generatePreviewBtn");
const downloadBtn = document.getElementById("downloadQrBtn");
const saveBtn = document.getElementById("saveQrChangesBtn");
const saveDefaultBtn = document.getElementById("saveDefaultSettings");
const svgBtn = document.getElementById("downloadSvgBtn");

const qrContentInput = document.getElementById("qrContentInput");
const logoInput = document.getElementById("qrLogoInput");

if (!bookId || !qrId) return;

/* ======================
   LOCAL DB
====================== */

let books = JSON.parse(localStorage.getItem("atqn_books") || "[]");

let bookIndex = books.findIndex(b => b.id === bookId);
if (bookIndex === -1) return;

books[bookIndex].qrs = books[bookIndex].qrs || [];

let qrIndex = books[bookIndex].qrs.findIndex(q => q.id === qrId);
if (qrIndex === -1) return;

let book = books[bookIndex];
let qr = books[bookIndex].qrs[qrIndex];

/* ======================
   FILL INPUTS
====================== */

document.getElementById("bookNameInput").value = book.title || "";
document.getElementById("qrTitleInput").value = qr.title || "";
document.getElementById("qrDescriptionInput").value = qr.description || "";
qrContentInput.value = qr.content || "";

/* ======================
   RESTORE SETTINGS
====================== */

if (qr.qrSettings) {
    document.getElementById("qrColorInput").value = qr.qrSettings.color || "#000000";
    document.getElementById("qrSizeInput").value = qr.qrSettings.size || 300;
    document.getElementById("qrStyleInput").value = qr.qrSettings.style || "square";
}

/* ======================
   SAFE MERGE
====================== */

function mergeBooks(local, remote) {

    const map = new Map();

    local.forEach(b => map.set(b.id, b));

    remote.forEach(r => {
        const existing = map.get(r.id);

        if (!existing) {
            map.set(r.id, {
                ...r,
                qrs: r.qrs || []
            });
        } else {

            const localQrs = Array.isArray(existing.qrs) ? existing.qrs : [];
            const remoteQrs = Array.isArray(r.qrs) ? r.qrs : [];

            const mergedQrs = [...localQrs];

            remoteQrs.forEach(qr => {
                const exists = mergedQrs.find(x => x.id === qr.id);
                if (!exists) mergedQrs.push(qr);
            });

            map.set(r.id, {
                ...existing,
                ...r,
                qrs: mergedQrs
            });
        }
    });

    return Array.from(map.values());
}

/* ======================
   FIREBASE LISTENER
====================== */

const globalRef = db && doc ? doc(db, "books", "global") : null;

if (globalRef && onSnapshot) {

    onSnapshot(globalRef, (snap) => {

        if (!snap.exists()) return;

        const data = snap.data();
        if (!data.books) return;

        const remoteBooks = data.books;

        books = mergeBooks(books, remoteBooks);

        const bIndex = books.findIndex(b => b.id === bookId);

        if (bIndex !== -1) {

            const qIndex = books[bIndex].qrs?.findIndex(q => q.id === qrId);

            if (qIndex !== -1) {
                qr = books[bIndex].qrs[qIndex];

                qrContentInput.value = qr.content || "";
                document.getElementById("qrTitleInput").value = qr.title || "";
                document.getElementById("qrDescriptionInput").value = qr.description || "";
            }
        }
    });
}

/* ======================
   QR ENGINE
====================== */

let qrCode = null;

function generateQR(text) {

    if (!text) {
        qrPreviewBox.innerHTML = "أدخل النص أولاً";
        return;
    }

    const size = parseInt(document.getElementById("qrSizeInput").value || 300);
    const color = document.getElementById("qrColorInput").value || "#000000";
    const style = document.getElementById("qrStyleInput").value || "square";

    let logoSrc = "assets/atqn-logo.png";

    if (logoInput?.files?.[0]) {
        logoSrc = URL.createObjectURL(logoInput.files[0]);
    }

    if (!qrCode) {

        qrPreviewBox.innerHTML = "";

        qrCode = new QRCodeStyling({
            width: size,
            height: size,
            data: text,
            image: logoSrc,
            dotsOptions: { color, type: style },
            backgroundOptions: { color: "#ffffff" },
            imageOptions: { margin: 8, imageSize: 0.60 }
        });

        qrCode.append(qrPreviewBox);
        return;
    }

    qrCode.update({
        data: text,
        image: logoSrc,
        dotsOptions: { color, type: style },
        imageOptions: { margin: 8, imageSize: 0.60 }
    });
}

/* ======================
   FIRST LOAD
====================== */

qrPreviewBox.innerHTML = "اضغط توليد المعاينة";
generateQR(qr.content || "");

/* ======================
   REALTIME SAVE
====================== */

let syncTimer = null;

function realtimeSave() {

    clearTimeout(syncTimer);

    syncTimer = setTimeout(async () => {

        const title = document.getElementById("qrTitleInput").value.trim();
        const description = document.getElementById("qrDescriptionInput").value.trim();
        const content = qrContentInput.value.trim();

        if (!title || !content) return;

        let localBooks = JSON.parse(localStorage.getItem("atqn_books") || "[]");

        const bIndex = localBooks.findIndex(b => b.id === bookId);
        if (bIndex === -1) return;

        const qIndex = localBooks[bIndex].qrs.findIndex(q => q.id === qrId);
        if (qIndex === -1) return;

        localBooks[bIndex].qrs[qIndex] = {
            ...localBooks[bIndex].qrs[qIndex],
            title,
            description,
            content,
            updatedAt: Date.now()
        };

        const ref = doc(db, "books", "global");

        const snap = await window.firebaseFirestore.getDoc(ref);
        const remoteBooks = snap.exists() ? snap.data().books : [];

        setDoc(ref, {
            books: mergeBooks(localBooks, remoteBooks),
            updatedAt: Date.now()
        });

    }, 600);
}

/* ======================
   INPUTS
====================== */

qrContentInput?.addEventListener("input", realtimeSave);
document.getElementById("qrTitleInput")?.addEventListener("input", realtimeSave);
document.getElementById("qrDescriptionInput")?.addEventListener("input", realtimeSave);

["qrColorInput", "qrSizeInput", "qrStyleInput", "qrLogoInput"]
.forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", () => generateQR(qrContentInput.value.trim()));
    el.addEventListener("change", () => generateQR(qrContentInput.value.trim()));
});

qrContentInput?.addEventListener("input", () => {
    generateQR(qrContentInput.value.trim());
});

/* ======================
   SAVE BUTTON
====================== */

saveBtn?.addEventListener("click", async function () {

    const title = document.getElementById("qrTitleInput").value.trim();
    const description = document.getElementById("qrDescriptionInput").value.trim();
    const content = qrContentInput.value.trim();

    if (!title || !content) {
        alert("أدخل البيانات");
        return;
    }

    let localBooks = JSON.parse(localStorage.getItem("atqn_books") || "[]");

    const bIndex = localBooks.findIndex(b => b.id === bookId);
    const qIndex = localBooks[bIndex].qrs.findIndex(q => q.id === qrId);

    localBooks[bIndex].qrs[qIndex] = {
        ...localBooks[bIndex].qrs[qIndex],
        id: qrId,
        title,
        description,
        content,
        qrSettings: {
            color: document.getElementById("qrColorInput").value || "#000000",
            size: Number(document.getElementById("qrSizeInput").value || 300),
            style: document.getElementById("qrStyleInput").value || "square",
            logo: "assets/atqn-logo.png"
        },
        updatedAt: Date.now()
    };

    const ref = doc(db, "books", "global");

    const snap = await window.firebaseFirestore.getDoc(ref);
    const remoteBooks = snap.exists() ? snap.data().books : [];

    setDoc(ref, {
        books: mergeBooks(localBooks, remoteBooks),
        updatedAt: Date.now()
    });

    showToast("تم الحفظ بنجاح");

    setTimeout(() => {
        window.location.href = "book.html?id=" + bookId;
    }, 800);
});

/* ======================
   SETTINGS + DOWNLOAD (UNCHANGED)
====================== */

saveDefaultBtn?.addEventListener("click", function () {

    const settings = {
        color: document.getElementById("qrColorInput").value,
        size: document.getElementById("qrSizeInput").value,
        style: document.getElementById("qrStyleInput").value
    };

    localStorage.setItem("qr_default_settings", JSON.stringify(settings));

    showToast("تم حفظ الإعدادات الافتراضية");
});

downloadBtn?.addEventListener("click", function () {
    if (!qrCode) return;

    const name = (
        document.getElementById("bookNameInput").value + "_" +
        document.getElementById("qrTitleInput").value
    ).replace(/\s+/g, "_");

    qrCode.download({ name, extension: "png" });
});

svgBtn?.addEventListener("click", function () {
    if (!qrCode) return;

    const name = (
        document.getElementById("bookNameInput").value + "_" +
        document.getElementById("qrTitleInput").value
    ).replace(/\s+/g, "_");

    qrCode.download({ name, extension: "svg" });
});

});
