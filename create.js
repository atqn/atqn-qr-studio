document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);

    const bookId = Number(params.get("book"));
    const qrId = Number(params.get("qr"));

    const qrPreviewBox = document.getElementById("qrPreviewBox");
    const generateBtn = document.getElementById("generatePreviewBtn");
    const downloadBtn = document.getElementById("downloadQrBtn");

    const qrContentInput = document.getElementById("qrContentInput");

    if (!bookId || !qrId) return;

    const books =
        JSON.parse(localStorage.getItem("atqn_books")) || [];

    const book =
        books.find(b => b.id === bookId);

    if (!book || !book.qrs) return;

    const qr =
        book.qrs.find(q => q.id === qrId);

    if (!qr) return;

    // تعبئة الحقول
    document.getElementById("bookNameInput").value = book.title;
    document.getElementById("qrTitleInput").value = qr.title;
    document.getElementById("qrDescriptionInput").value = qr.description || "";
    qrContentInput.value = qr.content || "";

    function generateQR(text) {

        qrPreviewBox.innerHTML = "";

        new QRCode(qrPreviewBox, {
            text: text,
            width: 220,
            height: 220,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // توليد أولي تلقائي
    generateQR(qr.content || "");

    // زر التوليد
    generateBtn.addEventListener("click", function () {

        const text = qrContentInput.value.trim();

        if (!text) return;

        generateQR(text);
    });

    // زر التحميل PNG
    if (downloadBtn) {

        downloadBtn.addEventListener("click", function () {

            const canvas = qrPreviewBox.querySelector("canvas");

            if (!canvas) {
                alert("قم بتوليد QR أولاً");
                return;
            }

            const link = document.createElement("a");
            link.download = "qr-code.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    }

});
