function waitFirebaseReady(callback) {

    const check = () => {

        if (window.firebaseFirestore?.doc && window.db) {
            callback();
        } else {
            setTimeout(check, 100);
        }
    };

    check();
}

document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const bookId = Number(params.get("id"));

    const db = window.db;
    const fs = window.firebaseFirestore || {};
    const { doc, setDoc, onSnapshot } = fs;

    const booksRef = doc(db, "books", "global");

    let books = [];
    let currentBook = null;

    const qrList = document.getElementById("qrList");
    const addQrBtn = document.getElementById("addQrBtn");

    let editQrId = null;
    let deleteQrId = null;

    /* ======================
       LOAD REALTIME
    ====================== */
    onSnapshot(booksRef, (snap) => {

        if (!snap.exists()) return;

        books = snap.data().books || [];

        currentBook = books.find(b => b.id === bookId);

        if (!currentBook) return;

        updateHeader();
        renderQrList();
    });

    /* ======================
       HEADER
    ====================== */
    function updateHeader() {
        if (!currentBook) return;

        document.getElementById("bookTitle").textContent = currentBook.title;
        document.getElementById("bookCount").textContent =
            "عدد الأكواد: " + (currentBook.qrs?.length || 0);
    }

    /* ======================
       RENDER
    ====================== */
    function renderQrList() {

        if (!currentBook) return;

        qrList.innerHTML = "";

        (currentBook.qrs || []).forEach(qr => {

            qrList.innerHTML += `
<div class="book-card">

    <div class="book-icon">🔗</div>

    <h3>${qr.title}</h3>

    <div class="qr-description">${qr.description || ""}</div>

    <div class="book-actions">

        <button class="action-btn edit-btn" data-edit="${qr.id}">✏️</button>
        <button class="action-btn delete-btn" data-delete="${qr.id}">🗑</button>

    </div>

    <button class="book-btn" data-open="${qr.id}">
        📖 فتح
    </button>

</div>`;
        });
    }

    /* ======================
       CLICK
    ====================== */
    qrList.addEventListener("click", function (e) {

        const edit = e.target.dataset.edit;
        const del = e.target.dataset.delete;
        const open = e.target.dataset.open;

        if (edit) editQr(Number(edit));
        if (del) deleteQr(Number(del));

        if (open) {
            window.location.href = "create.html?book=" + bookId + "&qr=" + open;
        }
    });

    /* ======================
       ADD QR
    ====================== */
    addQrBtn.addEventListener("click", () => {
        document.getElementById("addQrModal").classList.add("show");
    });

    /* ======================
       SAVE QR
    ====================== */
    document.getElementById("saveQrBtn")?.addEventListener("click", async function () {

        const title = qrTitleInput.value.trim();
        const description = qrDescriptionInput.value.trim();
        const link = qrLinkInput.value.trim();

        if (!title || !link) return;

        const index = books.findIndex(b => b.id === bookId);

        if (editQrId) {

            const qIndex = books[index].qrs.findIndex(q => q.id === editQrId);

            books[index].qrs[qIndex] = {
                id: editQrId,
                title,
                description,
                content: link
            };

        } else {

            books[index].qrs.push({
                id: Date.now(),
                title,
                description,
                content: link
            });
        }

        books[index].count = books[index].qrs.length;

        await setDoc(booksRef, { books });

        document.getElementById("addQrModal").classList.remove("show");
    });

    /* ======================
       DELETE QR
    ====================== */
    function deleteQr(id) {

        const index = books.findIndex(b => b.id === bookId);

        books[index].qrs =
            books[index].qrs.filter(q => q.id !== id);

        books[index].count = books[index].qrs.length;

        setDoc(booksRef, { books });

        document.getElementById("deleteQrModal").classList.remove("show");
    }

});
