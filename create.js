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
    // تعبئة الحقول
    // =========================
    document.getElementById("bookNameInput").value = book.title || "";
    document.getElementById("qrTitleInput").value = qr.title || "";
    document.getElementById("qrDescriptionInput").value = qr.description || "";
    qrContentInput.value = qr.content || "";

    // =========================
    // QR OBJECT (GLOBAL)
    // =========================
    let qrCode = null;

    function generateQR(text) {

        qrPreviewBox.innerHTML = "";

        if (!text) return;

        const size =
            parseInt(document.getElementById("qrSizeInput").value || 300);

        const color =
            document.getElementById("qrColorInput").value || "#000000";

        const style =
            document.getElementById("qrStyleInput").value || "square";

        let dotsType = "square";

        if (style === "dots") dotsType = "dots";
        if (style === "rounded") dotsType = "rounded";
        if (style === "classy") dotsType = "classy";
        if (style === "classy-rounded") dotsType = "classy-rounded";

        const logoFile =
            logoInput?.files?.[0];

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
                crossOrigin: "anonymous",
                margin: 6,
                imageSize: 0.25
            }
        });

        qrCode.append(qrPreviewBox);
    }

    // =========================
    // أول تشغيل
    // =========================
    generateQR(qr.content || "");

    // =========================
    // زر التوليد
    // =========================
    if (generateBtn) {

        generateBtn.addEventListener("click", function () {

            const text = qrContentInput.value.trim();

            if (!text) return;

            generateQR(text);
        });
    }

    // =========================
    // تحديث مباشر للإعدادات
    // =========================
    ["qrColorInput", "qrSizeInput", "qrStyleInput", "qrLogoInput"].forEach(id => {

        const el = document.getElementById(id);

        if (el) {

            el.addEventListener("change", function () {

                const text =
                    qrContentInput.value.trim();

                if (text) generateQR(text);
            });
        }
    });

    // =========================
    // الحفظ
    // =========================
    if (saveBtn) {

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

            books[bookIndex].qrs[qrIndex] = {
                id: qrId,
                title,
                description,
                content
            };

            localStorage.setItem("atqn_books", JSON.stringify(books));

            alert("تم حفظ التعديلات بنجاح");

            window.location.href = "book.html?id=" + bookId;
        });
    }

    // =========================
    // تحميل PNG احترافي
    // =========================
    if (downloadBtn) {

        downloadBtn.addEventListener("click", function () {

            if (!qrCode) return;

            qrCode.download({
                name: "qr-code",
                extension: "png"
            });
        });
    }

});
