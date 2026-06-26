let books = [];
let currentBook = null;
let currentQR = null;
let qrCode = null;

/* ======================
   AUTO INIT FIX
====================== */
document.addEventListener("DOMContentLoaded", () => {

    const generateBtn = document.getElementById("generatePreviewBtn");

    if (generateBtn) {
        generateBtn.addEventListener("click", () => {
            if (typeof generateQR === "function") {
                generateQR();
            }
        });
    }

    // تشغيل تلقائي أول مرة
    setTimeout(() => {
        if (typeof generateQR === "function") {
            generateQR();
        }
    }, 300);
});

/* ======================
   FIX INPUTS AUTO UPDATE
====================== */
function safeBind(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", () => {
        if (typeof generateQR === "function") generateQR();
    });

    el.addEventListener("change", () => {
        if (typeof generateQR === "function") generateQR();
    });
}

safeBind("qrTitleInput");
safeBind("qrDescriptionInput");
safeBind("qrContentInput");
safeBind("qrColorInput");
safeBind("qrSizeInput");
