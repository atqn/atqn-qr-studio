document.addEventListener("DOMContentLoaded", function () {

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
    // QR OBJECT
    // ======================
    let qrCode = null;

    // ======================
    // FIXED GENERATE
    // ======================
    function generateQR(text) {

        qrPreviewBox.innerHTML = "";

        if (!text) {
            qrPreviewBox.innerHTML = "أدخل النص أولاً";
            return;
        }

        const size = parseInt(document.getElementById("qrSizeInput").value || 300);
        const color = document.getElementById("qrColorInput").value || "#000000";
        const style = document.getElementById("qrStyleInput").value || "square";

        let logoFile = logoInput?.files?.[0];

        let dotsType = style;

        // mapping safe
        if (!["square", "dots", "rounded", "classy", "classy-rounded", "extra-rounded"].includes(dotsType)) {
            dotsType = "square";
        }

        qrCode = new QRCodeStyling({
            width: size,
            height: size,
            data: text,

            image: logoFile
                ? URL.createObjectURL(logoFile)
                : "assets/atqn-logo.png",

            dotsOptions: {
                color: color,
                type: dotsType
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

    // ======================
    // FIRST LOAD
    // ======================
    qrPreviewBox.innerHTML = "اضغط توليد المعاينة";

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
    // SAVE QR (STABLE)
    // ======================
    saveBtn?.addEventListener("click", function () {

        let title = document.getElementById("qrTitleInput").value.trim();
        let description = document.getElementById("qrDescriptionInput").value.trim();
        let content = qrContentInput.value.trim();

        if (!title || !content) {
            alert("أدخل البيانات");
            return;
        }

        books = JSON.parse(localStorage.getItem("atqn_books") || "[]");

        let bIndex = books.findIndex(b => b.id === bookId);
        let qIndex = books[bIndex].qrs.findIndex(q => q.id === qrId);

        books[bIndex].qrs[qIndex] = {
            id: qrId,
            title,
            description,
            content
        };

        localStorage.setItem("atqn_books", JSON.stringify(books));

        alert("تم الحفظ بنجاح");

        window.location.href = "book.html?id=" + bookId;
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
