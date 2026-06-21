document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);

    const bookId = Number(params.get("book"));
    const qrId = Number(params.get("qr"));

    const qrPreviewBox = document.getElementById("qrPreviewBox");
    const generateBtn = document.getElementById("generatePreviewBtn");
    const downloadBtn = document.getElementById("downloadQrBtn");
    const saveBtn = document.getElementById("saveQrChangesBtn");
    const saveDefaultBtn = document.getElementById("saveDefaultSettings");

    const qrContentInput = document.getElementById("qrContentInput");
    const logoInput = document.getElementById("qrLogoInput");

    if (!bookId || !qrId) return;

    // ======================
    // LOAD DATABASE (SAFE)
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
    // DEFAULT SETTINGS
    // ======================
    let defaultSettings =
        JSON.parse(localStorage.getItem("qr_default_settings") || "{}");

    document.getElementById("bookNameInput").value = book.title || "";
    document.getElementById("qrTitleInput").value = qr.title || "";
    document.getElementById("qrDescriptionInput").value = qr.description || "";
    qrContentInput.value = qr.content || "";

    // apply defaults if no saved settings
    document.getElementById("qrColorInput").value =
        qr.qrSettings?.color || defaultSettings.color || "#000000";

    document.getElementById("qrSizeInput").value =
        qr.qrSettings?.size || defaultSettings.size || 300;

    document.getElementById("qrStyleInput").value =
        qr.qrSettings?.style || defaultSettings.style || "square";

    let qrCode = null;
    let isGenerated = false;

    // ======================
    // GENERATE QR
    // ======================
    function generateQR(text) {

        qrPreviewBox.innerHTML = "";

        if (!text) {
            qrPreviewBox.innerHTML = "أدخل النص أولاً";
            return;
        }

        let size = parseInt(document.getElementById("qrSizeInput").value);
        let color = document.getElementById("qrColorInput").value;
        let style = document.getElementById("qrStyleInput").value;

        let logoFile = logoInput?.files?.[0];

        qrCode = new QRCodeStyling({
            width: size,
            height: size,
            data: text,

            image: logoFile
                ? URL.createObjectURL(logoFile)
                : "assets/atqn-logo.png",

            dotsOptions: {
                color: color,
                type: style
            },

            backgroundOptions: {
                color: "#ffffff"
            },

            imageOptions: {
                margin: 10,
                imageSize: 0.25
            }
        });

        qrCode.append(qrPreviewBox);

        isGenerated = true;
    }

    // ======================
    // FIRST LOAD (NO AUTO SHOW)
    // ======================
    qrPreviewBox.innerHTML = "اضغط توليد المعاينة";

    // ======================
    // GENERATE BUTTON
    // ======================
    generateBtn.addEventListener("click", function () {
        generateQR(qrContentInput.value.trim());
    });

    // ======================
    // AUTO UPDATE AFTER GENERATE
    // ======================
    ["qrColorInput", "qrSizeInput", "qrStyleInput", "qrLogoInput"].forEach(id => {

        const el = document.getElementById(id);

        if (el) {
            el.addEventListener("change", function () {
                if (!isGenerated) return;
                generateQR(qrContentInput.value.trim());
            });
        }
    });

    // ======================
    // SAVE QR (FIXED 100%)
    // ======================
    saveBtn.addEventListener("click", function () {

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
            content,
            qrSettings: {
                color: document.getElementById("qrColorInput").value,
                size: document.getElementById("qrSizeInput").value,
                style: document.getElementById("qrStyleInput").value
            }
        };

        localStorage.setItem("atqn_books", JSON.stringify(books));

        alert("تم الحفظ بنجاح");

        window.location.href = "book.html?id=" + bookId;
    });

    // ======================
    // SAVE DEFAULT SETTINGS
    // ======================
    saveDefaultBtn?.addEventListener("click", function () {

        let settings = {
            color: document.getElementById("qrColorInput").value,
            size: document.getElementById("qrSizeInput").value,
            style: document.getElementById("qrStyleInput").value
        };

        localStorage.setItem("qr_default_settings", JSON.stringify(settings));

        alert("تم حفظ الإعدادات الافتراضية");
    });

    // ======================
    // DOWNLOAD FIX
    // ======================
    downloadBtn.addEventListener("click", function () {

        if (!qrCode) return;

        let bookName = document.getElementById("bookNameInput").value || "Book";
        let qrTitle = document.getElementById("qrTitleInput").value || "QR";

        qrCode.download({
            name: `${bookName}_${qrTitle}`,
            extension: "png"
        });
    });

});
