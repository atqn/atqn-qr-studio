
document.addEventListener("DOMContentLoaded", function () {

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = type + " show";

    setTimeout(() => {
        toast.className = "";
    }, 2500);
}
    
    const params = new URLSearchParams(window.location.search);

    const bookId = Number(params.get("book"));
    const qrId = Number(params.get("qr"));

    const qrPreviewBox = document.getElementById("qrPreviewBox");
    const generateBtn = document.getElementById("generatePreviewBtn");
    const downloadBtn = document.getElementById("downloadQrBtn");
    const saveBtn = () => document.getElementById("saveQrChangesBtn");
    const saveDefaultBtn = document.getElementById("saveDefaultSettings");
    const svgBtn = document.getElementById("downloadSvgBtn");

    const qrContentInput = document.getElementById("qrContentInput");
    const logoInput = document.getElementById("qrLogoInput");

    if (!bookId || !qrId) return;

    // ======================
    // LOAD DB
    // ======================
    let books = JSON.parse(localStorage.getItem("atqn_books") || "[]");

    let bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) return;

    if (!books[bookIndex].qrs) books[bookIndex].qrs = [];

    let qrIndex = books[bookIndex].qrs.findIndex(q => q.id === qrId);
    if (qrIndex === -1) return;

    let book = books[bookIndex];
    let qr = books[bookIndex].qrs[qrIndex];

    // ======================
    // FILL INPUTS
    // ======================
    document.getElementById("bookNameInput").value = book.title || "";
    document.getElementById("qrTitleInput").value = qr.title || "";
    document.getElementById("qrDescriptionInput").value = qr.description || "";
    qrContentInput.value = qr.content || "";

    // ======================
    // RESTORE SETTINGS (FIXED)
    // ======================
    if (qr.qrSettings) {
        document.getElementById("qrColorInput").value = qr.qrSettings.color || "#000000";
        document.getElementById("qrSizeInput").value = qr.qrSettings.size || 300;
        document.getElementById("qrStyleInput").value = qr.qrSettings.style || "square";
    }

    let qrCode = null;

    // ======================
    // GENERATE (FIXED STABLE)
    // ======================
    function generateQR(text) {

        if (!text) {
            qrPreviewBox.innerHTML = "أدخل النص أولاً";
            return;
        }

        qrPreviewBox.innerHTML = "";

        const size = parseInt(document.getElementById("qrSizeInput").value || 300);
        const color = document.getElementById("qrColorInput").value || "#000000";
        const style = document.getElementById("qrStyleInput").value || "square";

        // ✔ إصلاح الشعار (بدون URL.createObjectURL تكرار)
        const logoFile = logoInput?.files?.[0];
        const logoSrc = logoFile
            ? URL.createObjectURL(logoFile)
            : "assets/atqn-logo.png";

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
                imageSize: 0.25
            }
        });

        qrCode.append(qrPreviewBox);
    }

    // ======================
    // FIRST LOAD
    // ======================
    qrPreviewBox.innerHTML = "اضغط توليد المعاينة";

    // توليد أولي تلقائي عند فتح الصفحة
    generateQR(qr.content || "");

    // ======================
    // MANUAL GENERATE
    // ======================
    generateBtn?.addEventListener("click", function () {
        generateQR(qrContentInput.value.trim());
    });

    // ======================
    // LIVE UPDATE (REAL FIX)
    // ======================
    function liveUpdate() {
        const text = qrContentInput.value.trim();
        if (text) generateQR(text);
    }

    ["qrColorInput", "qrSizeInput", "qrStyleInput", "qrLogoInput"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            el.addEventListener("input", liveUpdate);
            el.addEventListener("change", liveUpdate);
        });

    qrContentInput.addEventListener("input", liveUpdate);

    // ======================
    // SAVE QR (FIXED + STABLE)
    // ======================
document.addEventListener("click", function (e) {

    if (e.target && e.target.id === "saveQrChangesBtn") {

        console.log("SAVE CLICKED");

        let title = document.getElementById("qrTitleInput").value.trim();
        let description = document.getElementById("qrDescriptionInput").value.trim();
        let content = document.getElementById("qrContentInput").value.trim();

        if (!title || !content) {
            alert("أدخل البيانات");
            return;
        }

        let books = JSON.parse(localStorage.getItem("atqn_books") || "[]");

        let bookIndex = books.findIndex(b => b.id === bookId);
        let qrIndex = books[bookIndex].qrs.findIndex(q => q.id === qrId);

        books[bookIndex].qrs[qrIndex] = {
            id: qrId,
            title,
            description,
            content
        };

        localStorage.setItem("atqn_books", JSON.stringify(books));

        showToast("تم حفظ الباركود بنجاح");

        window.location.href = "book.html?id=" + bookId;
    }
});

    // ======================
    // SAVE DEFAULT SETTINGS
    // ======================
    saveDefaultBtn?.addEventListener("click", function () {

        const settings = {
            color: document.getElementById("qrColorInput").value,
            size: document.getElementById("qrSizeInput").value,
            style: document.getElementById("qrStyleInput").value
        };

        localStorage.setItem("qr_default_settings", JSON.stringify(settings));

        alert("تم حفظ الإعدادات الافتراضية");
    });

    // ======================
    // DOWNLOAD PNG
    // ======================
    downloadBtn?.addEventListener("click", function () {

        if (!qrCode) return;

        const bookName =
            document.getElementById("bookNameInput")?.value?.trim() || "Book";

        const qrTitle =
            document.getElementById("qrTitleInput")?.value?.trim() || "QR";

        qrCode.download({
            name: `${bookName}_${qrTitle}`.replace(/\s+/g, "_"),
            extension: "png"
        });
    });

    // ======================
    // DOWNLOAD SVG
    // ======================
    svgBtn?.addEventListener("click", function () {

        if (!qrCode) return;

        const bookName =
            document.getElementById("bookNameInput")?.value?.trim() || "Book";

        const qrTitle =
            document.getElementById("qrTitleInput")?.value?.trim() || "QR";

        qrCode.download({
            name: `${bookName}_${qrTitle}`.replace(/\s+/g, "_"),
            extension: "svg"
        });
    });

});

