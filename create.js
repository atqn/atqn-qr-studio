document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);

    const bookId = Number(params.get("book"));
    const qrId = Number(params.get("qr"));

    const qrPreviewBox = document.getElementById("qrPreviewBox");
    const generateBtn = document.getElementById("generatePreviewBtn");
    const downloadBtn = document.getElementById("downloadQrBtn");
    const saveBtn = document.getElementById("saveQrChangesBtn");

    const qrContentInput = document.getElementById("qrContentInput");

    if (!bookId || !qrId) {
        console.log("Missing bookId or qrId");
        return;
    }

    let books =
        JSON.parse(localStorage.getItem("atqn_books")) || [];

    const bookIndex =
        books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) return;

    const book =
        books[bookIndex];

    if (!book.qrs) book.qrs = [];

    const qrIndex =
        book.qrs.findIndex(q => q.id === qrId);

    if (qrIndex === -1) return;

    const qr =
        book.qrs[qrIndex];

    // تعبئة الحقول
    document.getElementById("bookNameInput").value = book.title;
    document.getElementById("qrTitleInput").value = qr.title || "";
    document.getElementById("qrDescriptionInput").value = qr.description || "";
    qrContentInput.value = qr.content || "";

    // =========================
    // QR GENERATOR (WITH LOGO)
    // =========================
    function generateQR(text) {

        qrPreviewBox.innerHTML = "";

        const tempDiv = document.createElement("div");

        new QRCode(tempDiv, {
            text: text,
            width: 240,
            height: 240,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        setTimeout(() => {

            const canvas = tempDiv.querySelector("canvas");
            if (!canvas) return;

            const ctx = canvas.getContext("2d");

            const logo = new Image();
            logo.src = "assets/atqn-logo.png";

            logo.onload = function () {

                const size = canvas.width * 0.22;

                const x = (canvas.width - size) / 2;
                const y = (canvas.height - size) / 2;

                ctx.drawImage(logo, x, y, size, size);

                qrPreviewBox.innerHTML = "";
                qrPreviewBox.appendChild(canvas);
            };

            qrPreviewBox.innerHTML = "";
            qrPreviewBox.appendChild(canvas);

        }, 120);
    }

    generateQR(qr.content || "");

    // توليد QR
    if (generateBtn) {
        generateBtn.addEventListener("click", function () {

            const text = qrContentInput.value.trim();
            if (!text) return;

            generateQR(text);
        });
    }

    // =========================
    // SAVE (FIXED 100%)
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

            let books =
                JSON.parse(localStorage.getItem("atqn_books")) || [];

            const bookIndex =
                books.findIndex(b => b.id === bookId);

            const qrIndex =
                books[bookIndex].qrs.findIndex(q => q.id === qrId);

            books[bookIndex].qrs[qrIndex] = {
                id: qrId,
                title,
                description,
                content
            };

            localStorage.setItem(
                "atqn_books",
                JSON.stringify(books)
            );

            alert("تم حفظ التعديلات بنجاح");

            window.location.href = "book.html?id=" + bookId;
        });
    }

    // =========================
    // DOWNLOAD PNG (PRO)
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
                `${bookName} - ${qrTitle}.png`
                    .replace(/\s+/g, "_");

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
