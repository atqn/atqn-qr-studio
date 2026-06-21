document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);

    const bookId = Number(params.get("book"));
    const qrId = Number(params.get("qr"));

    const qrPreviewBox = document.getElementById("qrPreviewBox");
    const generateBtn = document.getElementById("generatePreviewBtn");
    const downloadBtn = document.getElementById("downloadQrBtn");
    const saveBtn = document.getElementById("saveQrChangesBtn");

    const qrContentInput = document.getElementById("qrContentInput");
    const logoInput = document.getElementById("qrLogoInput");

    if (!bookId || !qrId) return;

    let books =
        JSON.parse(localStorage.getItem("atqn_books")) || [];

    const bookIndex =
        books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) return;

    if (!books[bookIndex].qrs) {
        books[bookIndex].qrs = [];
    }

    const qrIndex =
        books[bookIndex].qrs.findIndex(q => q.id === qrId);

    if (qrIndex === -1) return;

    const book = books[bookIndex];
    const qr = books[bookIndex].qrs[qrIndex];

    // =========================
    // استرجاع الإعدادات المحفوظة
    // =========================
    const savedSettings =
        qr.qrSettings || JSON.parse(localStorage.getItem("qr_default_settings")) || {};

    document.getElementById("bookNameInput").value = book.title || "";
    document.getElementById("qrTitleInput").value = qr.title || "";
    document.getElementById("qrDescriptionInput").value = qr.description || "";
    qrContentInput.value = qr.content || "";

    // تطبيق الإعدادات
    if (savedSettings.color)
        document.getElementById("qrColorInput").value = savedSettings.color;

    if (savedSettings.size)
        document.getElementById("qrSizeInput").value = savedSettings.size;

    if (savedSettings.style)
        document.getElementById("qrStyleInput").value = savedSettings.style;

    let qrCode = null;

    // =========================
    // بناء QR
    // =========================
    function generateQR(text) {

        qrPreviewBox.innerHTML = "";

        if (!text) return;

        const size =
            parseInt(document.getElementById("qrSizeInput").value || 300);

        const color =
            document.getElementById("qrColorInput").value || "#000000";

        const style =
            document.getElementById("qrStyleInput").value || "square";

        let dotsType = style;

        const logoFile =
            logoInput?.files?.[0];

        qrCode = new QRCodeStyling({
            width: size,
            height: size,
            data: text,

            image: logoFile
                ? URL.createObjectURL(logoFile)
                : (savedSettings.logo || "assets/atqn-logo.png"),

            dotsOptions: {
                color: color,
                type: dotsType
            },

            backgroundOptions: {
                color: "#ffffff"
            },

            imageOptions: {
                crossOrigin: "anonymous",
                margin: 10,
                imageSize: 0.28
            }
        });

        qrCode.append(qrPreviewBox);
    }

    // ❌ لا يظهر QR إلا بعد الضغط
    let qrGenerated = false;

    generateBtn.addEventListener("click", function () {

        const text = qrContentInput.value.trim();

        if (!text) return;

        generateQR(text);
        qrGenerated = true;
    });

    // =========================
    // Auto update
    // =========================
    ["qrColorInput", "qrSizeInput", "qrStyleInput"].forEach(id => {

        const el = document.getElementById(id);

        if (el) {
            el.addEventListener("change", function () {

                if (!qrGenerated) return;

                const text = qrContentInput.value.trim();
                if (text) generateQR(text);
            });
        }
    });

    // =========================
    // SAVE (QR + settings)
    // =========================
    saveBtn.addEventListener("click", function () {

        const title =
            document.getElementById("qrTitleInput").value.trim();

        const description =
            document.getElementById("qrDescriptionInput").value.trim();

        const content =
            document.getElementById("qrContentInput").value.trim();

        if (!title || !content) {
            alert("يرجى تعبئة البيانات");
            return;
        }

        const color =
            document.getElementById("qrColorInput").value;

        const size =
            document.getElementById("qrSizeInput").value;

        const style =
            document.getElementById("qrStyleInput").value;

        const logo =
            logoInput?.files?.[0]
                ? URL.createObjectURL(logoInput.files[0])
                : "assets/atqn-logo.png";

        books[bookIndex].qrs[qrIndex] = {
            id: qrId,
            title,
            description,
            content,
            qrSettings: {
                color,
                size,
                style,
                logo
            }
        };

        localStorage.setItem("atqn_books", JSON.stringify(books));

        alert("تم حفظ QR بنجاح");

        window.location.href = "book.html?id=" + bookId;
    });

    // =========================
    // PNG EXPORT (FIXED NAME)
    // =========================
    downloadBtn.addEventListener("click", function () {

        if (!qrCode) return;

        const bookName =
            document.getElementById("bookNameInput").value || "Book";

        const qrTitle =
            document.getElementById("qrTitleInput").value || "QR";

        const fileName =
            `${bookName} - ${qrTitle}`;

        qrCode.download({
            name: fileName,
            extension: "png"
        });
    });

    // =========================
    // SVG EXPORT (NEW)
    // =========================
    const svgBtn = document.querySelector(".export-btn:nth-child(2)");

    if (svgBtn) {
        svgBtn.addEventListener("click", function () {
            if (!qrCode) return;
            qrCode.download({ name: "qr", extension: "svg" });
        });
    }

    // =========================
    // PDF EXPORT (Canvas fallback)
    // =========================
    const pdfBtn = document.querySelector(".export-btn:nth-child(3)");

    if (pdfBtn) {
        pdfBtn.addEventListener("click", function () {

            if (!qrCode) return;

            qrCode.getRawData("png").then(blob => {

                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "qr.pdf";

                link.click();
            });
        });
    }

    // =========================
    // FIRST LOAD (hidden until generate)
    // =========================
    qrPreviewBox.innerHTML = "اضغط توليد المعاينة أولاً";

});
