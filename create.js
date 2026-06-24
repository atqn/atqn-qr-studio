
document.addEventListener("DOMContentLoaded", function () {

    const db = window.db;
    const fs = window.firebaseFirestore || {};
    const { doc, setDoc, onSnapshot } = fs;

    const params = new URLSearchParams(window.location.search);

    const bookId = Number(params.get("book"));
    const qrId = Number(params.get("qr"));

    const bookRef = doc(db, "books", "global");

    let books = [];
    let currentBook = null;
    let currentQR = null;

    const qrPreviewBox = document.getElementById("qrPreviewBox");

    const qrTitleInput = document.getElementById("qrTitleInput");
    const qrDescriptionInput = document.getElementById("qrDescriptionInput");
    const qrContentInput = document.getElementById("qrContentInput");

    const qrColorInput = document.getElementById("qrColorInput");
    const qrSizeInput = document.getElementById("qrSizeInput");
    const qrStyleInput = document.getElementById("qrStyleInput");
    const qrLogoInput = document.getElementById("qrLogoInput");

    const generateBtn = document.getElementById("generatePreviewBtn");
    const saveBtn = document.getElementById("saveQrChangesBtn");
    const downloadBtn = document.getElementById("downloadQrBtn");
    const svgBtn = document.getElementById("downloadSvgBtn");

    let qrCode = null;

    /* ======================
       REALTIME LOAD
    ====================== */
    onSnapshot(bookRef, (snap) => {

        if (!snap.exists()) return;

        books = snap.data().books || [];

        currentBook = books.find(b => b.id === bookId);
        if (!currentBook) return;

        currentQR = currentBook.qrs?.find(q => q.id === qrId);

        fillInputs();
        generateQR(currentQR?.content || "");
    });

    /* ======================
       FILL INPUTS
    ====================== */
    function fillInputs() {

        if (!currentBook) return;

        document.getElementById("bookNameInput").value = currentBook.title || "";

        if (!currentQR) return;

        qrTitleInput.value = currentQR.title || "";
        qrDescriptionInput.value = currentQR.description || "";
        qrContentInput.value = currentQR.content || "";

        if (currentQR.qrSettings) {

            qrColorInput.value = currentQR.qrSettings.color || "#000000";
            qrSizeInput.value = currentQR.qrSettings.size || 600;
            qrStyleInput.value = currentQR.qrSettings.style || "square";
        }
    }

    /* ======================
       QR GENERATOR
    ====================== */
    function generateQR(text) {

        if (!text) {
            qrPreviewBox.innerHTML = "أدخل المحتوى أولاً";
            return;
        }

        const size = parseInt(qrSizeInput.value || 600);
        const color = qrColorInput.value || "#000000";
        const style = qrStyleInput.value || "square";

        let logo = "assets/atqn-logo.png";

        if (qrLogoInput?.files?.[0]) {
            logo = URL.createObjectURL(qrLogoInput.files[0]);
        }

        qrPreviewBox.innerHTML = "";

        if (!qrCode) {

            qrCode = new QRCodeStyling({
                width: size,
                height: size,
                data: text,
                image: logo,
                dotsOptions: {
                    color: color,
                    type: style
                },
                backgroundOptions: {
                    color: "#fff"
                },
                imageOptions: {
                    margin: 6,
                    imageSize: 0.6
                }
            });

            qrCode.append(qrPreviewBox);

        } else {

            qrCode.update({
                data: text,
                image: logo,
                dotsOptions: {
                    color: color,
                    type: style
                }
            });
        }
    }

    /* ======================
       EVENTS
    ====================== */
    generateBtn?.addEventListener("click", function () {
        generateQR(qrContentInput.value.trim());
    });

    qrContentInput?.addEventListener("input", function () {
        generateQR(qrContentInput.value.trim());
    });

    qrTitleInput?.addEventListener("input", autoSave);
    qrDescriptionInput?.addEventListener("input", autoSave);
    qrContentInput?.addEventListener("input", autoSave);

    qrColorInput?.addEventListener("change", () => generateQR(qrContentInput.value));
    qrSizeInput?.addEventListener("change", () => generateQR(qrContentInput.value));
    qrStyleInput?.addEventListener("change", () => generateQR(qrContentInput.value));
    qrLogoInput?.addEventListener("change", () => generateQR(qrContentInput.value));

    /* ======================
       AUTO SAVE (FIREBASE ONLY)
    ====================== */
    let timer = null;

    function autoSave() {

        clearTimeout(timer);

        timer = setTimeout(async () => {

            const title = qrTitleInput.value.trim();
            const description = qrDescriptionInput.value.trim();
            const content = qrContentInput.value.trim();

            if (!title || !content) return;

            const index = books.findIndex(b => b.id === bookId);
            if (index === -1) return;

            const qIndex = books[index].qrs.findIndex(q => q.id === qrId);
            if (qIndex === -1) return;

            books[index].qrs[qIndex] = {
                ...books[index].qrs[qIndex],
                title,
                description,
                content,
                qrSettings: {
                    color: qrColorInput.value,
                    size: Number(qrSizeInput.value),
                    style: qrStyleInput.value
                },
                updatedAt: Date.now()
            };

            await setDoc(bookRef, { books });

        }, 500);
    }

    /* ======================
       SAVE BUTTON (MANUAL)
    ====================== */
    saveBtn?.addEventListener("click", async function () {

        const index = books.findIndex(b => b.id === bookId);
        const qIndex = books[index].qrs.findIndex(q => q.id === qrId);

        books[index].qrs[qIndex] = {
            ...books[index].qrs[qIndex],
            title: qrTitleInput.value,
            description: qrDescriptionInput.value,
            content: qrContentInput.value,
            qrSettings: {
                color: qrColorInput.value,
                size: Number(qrSizeInput.value),
                style: qrStyleInput.value
            }
        };

        await setDoc(bookRef, { books });

        window.location.href = "book.html?id=" + bookId;
    });

    /* ======================
       DOWNLOADS
    ====================== */
    downloadBtn?.addEventListener("click", () => {
        if (!qrCode) return;
        qrCode.download({ extension: "png" });
    });

    svgBtn?.addEventListener("click", () => {
        if (!qrCode) return;
        qrCode.download({ extension: "svg" });
    });

});
