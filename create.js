import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

const params = new URLSearchParams(window.location.search);

const paramBookId = Number(params.get("book"));
const paramQrId = Number(params.get("qr"));

let books = [];
let currentBook = null;
let currentQR = null;
let qrCode = null;
let uploadedLogo = null;
let syncTimer = null;

const bookSelect = document.getElementById("bookSelect");

const qrTitleInput = document.getElementById("qrTitleInput");
const qrDescriptionInput = document.getElementById("qrDescriptionInput");
const qrContentInput = document.getElementById("qrContentInput");

const qrColorInput = document.getElementById("qrColorInput");
const qrStyleInput = document.getElementById("qrStyleInput");
const qrSizeInput = document.getElementById("qrSizeInput");
const qrLogoInput = document.getElementById("qrLogoInput");

const qrPreviewBox = document.getElementById("qrPreviewBox");

const generatePreviewBtn = document.getElementById("generatePreviewBtn");
const saveQrChangesBtn = document.getElementById("saveQrChangesBtn");
const downloadQrBtn = document.getElementById("downloadQrBtn");
const downloadSvgBtn = document.getElementById("downloadSvgBtn");

const toast = document.getElementById("toast");

async function ensureDatabase() {
    const snap = await getDoc(booksRef);

    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

function showToast(message, type = "success") {
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

function normalizeContent(value) {
    const text = value.trim();

    if (!text) return "";

    if (
        text.startsWith("http://") ||
        text.startsWith("https://") ||
        text.startsWith("tel:") ||
        text.startsWith("mailto:") ||
        text.startsWith("wa.me") ||
        text.startsWith("https://wa.me")
    ) {
        return text;
    }

    if (text.includes(".") && !text.includes(" ")) {
        return "https://" + text;
    }

    return text;
}

function getSelectedBookId() {
    return Number(bookSelect.value);
}

function getBookIndex(bookId) {
    return books.findIndex((book) => book.id === bookId);
}

function getQrIndex(bookIndex, qrId) {
    return (books[bookIndex].qrs || []).findIndex((qr) => qr.id === qrId);
}

function getLogoSource() {
    const logoMode = document.querySelector("input[name='logoMode']:checked")?.value || "default";

    if (logoMode === "upload" && uploadedLogo) {
        return uploadedLogo;
    }

    return "assets/atqn-logo.png";
}

function getQrSettings() {
    return {
        color: qrColorInput.value || "#38bdf8",
        style: qrStyleInput.value || "square",
        size: Number(qrSizeInput.value || 600),
        logoMode: document.querySelector("input[name='logoMode']:checked")?.value || "default"
    };
}

function renderBookSelect() {
    bookSelect.innerHTML = "";

    if (books.length === 0) {
        bookSelect.innerHTML = `<option value="">لا توجد كتب</option>`;
        return;
    }

    books.forEach((book) => {
        bookSelect.innerHTML += `
            <option value="${book.id}">
                ${book.title}
            </option>
        `;
    });

    if (paramBookId) {
        bookSelect.value = String(paramBookId);
    }
}

function loadCurrentData() {
    const selectedBookId = getSelectedBookId();

    currentBook = books.find((book) => book.id === selectedBookId) || null;

    if (!currentBook) return;

    currentBook.qrs = currentBook.qrs || [];

    if (paramQrId) {
        currentQR = currentBook.qrs.find((qr) => qr.id === paramQrId) || null;
    }

    if (currentQR) {
        qrTitleInput.value = currentQR.title || "";
        qrDescriptionInput.value = currentQR.description || "";
        qrContentInput.value = currentQR.content || "";

        if (currentQR.qrSettings) {
            qrColorInput.value = currentQR.qrSettings.color || "#38bdf8";
            qrStyleInput.value = currentQR.qrSettings.style || "square";
            qrSizeInput.value = currentQR.qrSettings.size || 600;

            const logoMode = currentQR.qrSettings.logoMode || "default";
            const radio = document.querySelector(`input[name='logoMode'][value="${logoMode}"]`);
            if (radio) radio.checked = true;
        }
    }
}

function generateQR() {
    const content = normalizeContent(qrContentInput.value);

    if (!content) {
        qrPreviewBox.innerHTML = "أدخل الرابط أو المحتوى أولًا";
        return;
    }

    const size = Number(qrSizeInput.value || 600);
    const color = qrColorInput.value || "#38bdf8";
    const style = qrStyleInput.value || "square";
    const logoSource = getLogoSource();

    qrPreviewBox.innerHTML = "";

    qrCode = new QRCodeStyling({
        width: size,
        height: size,
        data: content,
        image: logoSource,

        qrOptions: {
            errorCorrectionLevel: "H"
        },

        dotsOptions: {
            color: color,
            type: style
        },

        cornersSquareOptions: {
            color: color,
            type: style === "dots" ? "dot" : "extra-rounded"
        },

        cornersDotOptions: {
            color: color,
            type: "dot"
        },

        backgroundOptions: {
            color: "#ffffff"
        },

        imageOptions: {
            margin: 8,
            imageSize: 0.35,
            hideBackgroundDots: true
        }
    });

    qrCode.append(qrPreviewBox);
}

async function saveQR(showMessage = true) {
    const title = qrTitleInput.value.trim();
    const description = qrDescriptionInput.value.trim();
    const content = normalizeContent(qrContentInput.value);

    if (!title || !content) {
        if (showMessage) showToast("أدخل عنوان QR والرابط", "error");
        return;
    }

    const bookId = getSelectedBookId();
    const bookIndex = getBookIndex(bookId);

    if (bookIndex === -1) {
        if (showMessage) showToast("اختر كتابًا صحيحًا", "error");
        return;
    }

    books[bookIndex].qrs = books[bookIndex].qrs || [];

    const qrSettings = getQrSettings();

    if (paramQrId) {
        const qrIndex = getQrIndex(bookIndex, paramQrId);

        if (qrIndex !== -1) {
            books[bookIndex].qrs[qrIndex] = {
                ...books[bookIndex].qrs[qrIndex],
                title,
                description,
                content,
                qrSettings,
                updatedAt: Date.now()
            };
        }
    } else {
        const newQr = {
            id: Date.now(),
            title,
            description,
            content,
            qrSettings,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        books[bookIndex].qrs.push(newQr);
        currentQR = newQr;
    }

    books[bookIndex].count = books[bookIndex].qrs.length;

    await setDoc(booksRef, { books });

    generateQR();

    if (showMessage) {
        showToast("تم الحفظ بنجاح");
    }
}

function autoSave() {
    if (!currentQR && !paramQrId) return;

    clearTimeout(syncTimer);

    syncTimer = setTimeout(() => {
        saveQR(false);
    }, 700);
}

qrLogoInput.addEventListener("change", () => {
    const file = qrLogoInput.files?.[0];

    if (!file) return;

    uploadedLogo = URL.createObjectURL(file);

    const uploadRadio = document.querySelector(`input[name='logoMode'][value="upload"]`);
    if (uploadRadio) uploadRadio.checked = true;

    generateQR();
    autoSave();
});

generatePreviewBtn.addEventListener("click", generateQR);

saveQrChangesBtn.addEventListener("click", async () => {
    await saveQR(true);
});

downloadQrBtn.addEventListener("click", () => {
    if (!qrCode) generateQR();
    if (!qrCode) return;

    const bookName = currentBook?.title || "book";
    const qrTitle = qrTitleInput.value || "qr";

    const name = `${bookName}_${qrTitle}`.replace(/\s+/g, "_");

    qrCode.download({
        name,
        extension: "png"
    });
});

downloadSvgBtn.addEventListener("click", () => {
    if (!qrCode) generateQR();
    if (!qrCode) return;

    const bookName = currentBook?.title || "book";
    const qrTitle = qrTitleInput.value || "qr";

    const name = `${bookName}_${qrTitle}`.replace(/\s+/g, "_");

    qrCode.download({
        name,
        extension: "svg"
    });
});

[
    qrTitleInput,
    qrDescriptionInput,
    qrContentInput,
    qrColorInput,
    qrStyleInput,
    qrSizeInput,
    bookSelect
].forEach((element) => {
    element.addEventListener("input", () => {
        generateQR();
        autoSave();
    });

    element.addEventListener("change", () => {
        generateQR();
        autoSave();
    });
});

document.querySelectorAll("input[name='logoMode']").forEach((radio) => {
    radio.addEventListener("change", () => {
        generateQR();
        autoSave();
    });
});

bookSelect.addEventListener("change", () => {
    currentBook = books.find((book) => book.id === getSelectedBookId()) || null;
});

ensureDatabase();

onSnapshot(booksRef, (snap) => {
    const data = snap.data();

    books = data?.books || [];

    renderBookSelect();

    if (!bookSelect.value && books.length > 0) {
        bookSelect.value = String(books[0].id);
    }

    loadCurrentData();

    if (qrContentInput.value.trim()) {
        generateQR();
    }
});
