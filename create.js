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
    // توليد QR + STYLE + LOGO
    // =========================
    function generateQR(text) {

        qrPreviewBox.innerHTML = "";

        if (!text) {
            qrPreviewBox.innerHTML = "أدخل نص لتوليد QR";
            return;
        }

        const size =
            parseInt(document.getElementById("qrSizeInput")?.value || 240);

        const color =
            document.getElementById("qrColorInput")?.value || "#000000";

        const style =
            document.getElementById("qrStyleInput")?.value || "square";

        const container = document.createElement("div");
        qrPreviewBox.appendChild(container);

        new QRCode(container, {
            text: text,
            width: size,
            height: size,
            colorDark: color,
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // ===== إضافة الشعار =====
        setTimeout(() => {

            const canvas = container.querySelector("canvas");
            if (!canvas) return;

            const ctx = canvas.getContext("2d");

            const logo = new Image();
            logo.src = logoInput?.files?.[0]
                ? URL.createObjectURL(logoInput.files[0])
                : "assets/atqn-logo.png";

            logo.onload = function () {

                const logoSize = canvas.width * 0.22;

                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;

                ctx.drawImage(logo, x, y, logoSize, logoSize);
            };

        }, 120);
    }

    // أول تشغيل
    generateQR(qr.content || "");

    // =========================
    // زر التوليد
    // =========================
    if (generateBtn) {

        generateBtn.addEventListener("click", function () {

            const text = qrContentInput.value.trim();

            if (!text) {
                alert("أدخل محتوى QR");
                return;
            }

            generateQR(text);
        });
    }

    // =========================
    // إعادة توليد عند تغيير الإعدادات
    // =========================
    ["qrColorInput", "qrSizeInput", "qrStyleInput"].forEach(id => {

        const el = document.getElementById(id);

        if (el) {
            el.addEventListener("change", function () {
                const text = qrContentInput.value.trim();
                if (text) generateQR(text);
            });
        }
    });

    // =========================
    // الحفظ (مضمون 100%)
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
    // تحميل PNG
    // =========================
    if (downloadBtn) {

        downloadBtn.addEventListener("click", function () {

            const canvas =
                qrPreviewBox.querySelector("canvas");

            if (!canvas) {
                alert("قم بتوليد QR أولاً");
                return;
            }

            const scale = 4;

            const tempCanvas =
                document.createElement("canvas");

            const ctx =
                tempCanvas.getContext("2d");

            tempCanvas.width = canvas.width * scale;
            tempCanvas.height = canvas.height * scale;

            ctx.scale(scale, scale);
            ctx.drawImage(canvas, 0, 0);

            const imageURL =
                tempCanvas.toDataURL("image/png");

            const bookName =
                document.getElementById("bookNameInput").value || "Book";

            const qrTitle =
                document.getElementById("qrTitleInput").value || "QR";

            const fileName =
                `${bookName} - ${qrTitle}.png`.replace(/\s+/g, "_");

            const link =
                document.createElement("a");

            link.download = fileName;
            link.href = imageURL;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

});
