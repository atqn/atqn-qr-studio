<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
</script>

document.addEventListener("DOMContentLoaded", function () {

function safeGet(callback, fallback = null) {
    try {
        return callback();
    } catch (e) {
        console.warn("Safe Error:", e);
        return fallback;
    }
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;

    // reset state
    toast.className = "toast";

    // force reflow
    void toast.offsetWidth;

    // show
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
   LOAD DB
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

    /* ======================
       FIRST INIT ONLY
    ====================== */
    if (!qrCode) {

        qrPreviewBox.innerHTML = "";

        qrCode = new QRCodeStyling({
            width: size,
            height: size,
            data: text,
            image: logoSrc,

            dotsOptions: {
                color: color,
                type: style
            },

            backgroundOptions: {
                color: "#ffffff"
            },

            imageOptions: {
                margin: 8,
                imageSize: 0.60
            }
        });

        qrCode.append(qrPreviewBox);
        return;
    }

    /* ======================
       UPDATE ONLY
    ====================== */
    qrCode.update({
        data: text,
        image: logoSrc,
        dotsOptions: {
            color: color,
            type: style
        },
        imageOptions: {
            margin: 8,
            imageSize: 0.60
        }
    });
}

/* ======================
   FIRST LOAD
====================== */
qrPreviewBox.innerHTML = "اضغط توليد المعاينة";
generateQR(qr.content || "");

/* ======================
   EVENTS
====================== */
generateBtn?.addEventListener("click", () => {
    generateQR(qrContentInput.value.trim());
});

["qrColorInput", "qrSizeInput", "qrStyleInput", "qrLogoInput"]
.forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    const update = () => {
        generateQR(qrContentInput.value.trim());
    };

    el.addEventListener("input", update);
    el.addEventListener("change", update);
});

qrContentInput?.addEventListener("input", () => {
    generateQR(qrContentInput.value.trim());
});

/* ======================
   SAVE
====================== */
saveBtn?.addEventListener("click", function () {

    let title = document.getElementById("qrTitleInput").value.trim();
    let description = document.getElementById("qrDescriptionInput").value.trim();
    let content = qrContentInput.value.trim();

    if (!title || !content) {
        alert("أدخل البيانات");
        return;
    }

    let books = JSON.parse(localStorage.getItem("atqn_books") || "[]");

    let bIndex = books.findIndex(b => b.id === bookId);
    let qIndex = books[bIndex].qrs.findIndex(q => q.id === qrId);

    let logo = "assets/atqn-logo.png";

    if (logoInput?.files?.[0]) {
        logo = URL.createObjectURL(logoInput.files[0]);
    }

    books[bIndex].qrs[qIndex] = {
        id: qrId,
        title,
        description,
        content,
        qrSettings: {
            color: document.getElementById("qrColorInput").value || "#000000",
            size: Number(document.getElementById("qrSizeInput").value || 300),
            style: document.getElementById("qrStyleInput").value || "square",
            logo
        },
        updatedAt: Date.now()
    };

    localStorage.setItem("atqn_books", JSON.stringify(books));

    showToast("تم الحفظ بنجاح");

    setTimeout(() => {
        window.location.href = "book.html?id=" + bookId;
    }, 800);
});

/* ======================
   DEFAULT SETTINGS
====================== */
saveDefaultBtn?.addEventListener("click", function () {

    let settings = {
        color: document.getElementById("qrColorInput").value,
        size: document.getElementById("qrSizeInput").value,
        style: document.getElementById("qrStyleInput").value
    };

    localStorage.setItem("qr_default_settings", JSON.stringify(settings));

    showToast("تم حفظ الإعدادات الافتراضية");
});

/* ======================
   DOWNLOAD PNG
====================== */
downloadBtn?.addEventListener("click", function () {

    if (!qrCode) return;

    const name = (
        document.getElementById("bookNameInput").value + "_" +
        document.getElementById("qrTitleInput").value
    ).replace(/\s+/g, "_");

    qrCode.download({ name, extension: "png" });
});

/* ======================
   DOWNLOAD SVG
====================== */
svgBtn?.addEventListener("click", function () {

    if (!qrCode) return;

    const name = (
        document.getElementById("bookNameInput").value + "_" +
        document.getElementById("qrTitleInput").value
    ).replace(/\s+/g, "_");

    qrCode.download({ name, extension: "svg" });
});

});
