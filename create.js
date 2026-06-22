

document.addEventListener("DOMContentLoaded", function () {

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    // ضع النص
    toast.textContent = message;

    // إعادة ضبط آمنة بدون كسر CSS
    toast.classList.remove("show", "success", "error");

    // إعادة رسم (حل مشكلة عدم الظهور أحياناً)
    void toast.offsetWidth;

    // إضافة الحالة
    toast.classList.add("show", type);

    // إخفاء تدريجي
    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
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

const UI = {
    qrPreviewBox,
    generateBtn,
    downloadBtn,
    saveBtn,
    saveDefaultBtn,
    svgBtn,
    qrContentInput,
    logoInput
};
    
if (!bookId || !qrId) return;

/* ======================
   LOAD DB
====================== */
let books = JSON.parse(localStorage.getItem("atqn_books") || "[]");

let bookIndex = books.findIndex(b => b.id === bookId);
if (bookIndex === -1) return;

if (!books[bookIndex].qrs) books[bookIndex].qrs = [];

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
    document.getElementById("qrColorInput").value =
        qr.qrSettings.color || "#000000";

    document.getElementById("qrSizeInput").value =
        qr.qrSettings.size || 300;

    document.getElementById("qrStyleInput").value =
        qr.qrSettings.style || "square";
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

    // 🟢 أهم تحسين: إعادة استخدام QR بدل إعادة إنشاء DOM بشكل فوضوي
    if (qrCode) {
        qrPreviewBox.innerHTML = "";
        qrCode.update({
            data: text,
            image: logoSrc,
            dotsOptions: {
                color: color,
                type: style
            },
            imageOptions: {
                margin: 8,
                imageSize: 0.28
            }
        });

        qrCode.append(qrPreviewBox);
        return;
    }

    // 🟢 أول مرة فقط
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
            imageSize: 0.28
        }
    });

    qrCode.append(qrPreviewBox);
}

/* ======================
   FIRST LOAD
====================== */
qrPreviewBox.innerHTML = "اضغط توليد المعاينة";
generateQR(qr.content || "");

/* ======================
   GENERATE BUTTON
====================== */
generateBtn?.addEventListener("click", function () {
    generateQR(qrContentInput.value.trim());
});

/* ======================
   LIVE UPDATE (CLEANED)
====================== */
["qrColorInput", "qrSizeInput", "qrStyleInput", "qrLogoInput"]
.forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    const update = () => {
        const text = qrContentInput.value.trim();
        if (text) generateQR(text);
    };

    el.addEventListener("input", update);
    el.addEventListener("change", update);
});

qrContentInput?.addEventListener("input", () => {
    generateQR(qrContentInput.value.trim());
});

/* ======================
   SAVE QR
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
    title: title || "",
    description: description || "",
    content: content || "",

    qrSettings: {
        color: document.getElementById("qrColorInput").value || "#000000",
        size: Number(document.getElementById("qrSizeInput").value || 300),
        style: document.getElementById("qrStyleInput").value || "square",
        logo: logo || "assets/atqn-logo.png"
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

    const name =
        (document.getElementById("bookNameInput").value + "_" +
        document.getElementById("qrTitleInput").value)
        .replace(/\s+/g, "_");

    qrCode.download({
        name,
        extension: "png"
    });
});

/* ======================
   DOWNLOAD SVG
====================== */
svgBtn?.addEventListener("click", function () {

    if (!qrCode) return;

    const name =
        (document.getElementById("bookNameInput").value + "_" +
        document.getElementById("qrTitleInput").value)
        .replace(/\s+/g, "_");

    qrCode.download({
        name,
        extension: "svg"
    });
});

});
