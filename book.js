document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const bookId = Number(params.get("id"));

    let editQrId = null;
    let deleteQrId = null;

    const db = window.db;
    const fs = window.firebaseFirestore || {};
    const { doc, onSnapshot, setDoc, updateDoc } = fs;

    const bookRef = doc(db, "books", "global");

    const qrList = document.getElementById("qrList");

    const addQrBtn = document.getElementById("addQrBtn");
    const addQrModal = document.getElementById("addQrModal");

    const qrTitleInput = document.getElementById("qrTitleInput");
    const qrDescriptionInput = document.getElementById("qrDescriptionInput");
    const qrLinkInput = document.getElementById("qrLinkInput");

    const saveQrBtn = document.getElementById("saveQrBtn");
    const cancelQrBtn = document.getElementById("cancelQrBtn");

    const deleteQrModal = document.getElementById("deleteQrModal");
    const confirmDeleteQrBtn = document.getElementById("confirmDeleteQrBtn");
    const cancelDeleteQrBtn = document.getElementById("cancelDeleteQrBtn");

    let books = [];
    let currentBook = null;

    /* ======================
       REALTIME LOAD (FIREBASE)
    ====================== */
    onSnapshot(bookRef, (snap) => {

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

        document.getElementById("bookTitle").textContent = currentBook.title || "";

        document.getElementById("bookCount").textContent =
            "عدد الأكواد: " + (currentBook.qrs?.length || 0);
    }

    /* ======================
       RENDER QR LIST
    ====================== */
    function renderQrList() {

        if (!currentBook || !qrList) return;

        const qrs = currentBook.qrs || [];

        qrList.innerHTML = "";

        if (qrs.length === 0) {

            qrList.innerHTML = `
                <div class="book-card">
                    <h3>لا توجد أكواد QR بعد</h3>
                    <div class="book-count">اضغط على إضافة QR جديد</div>
                </div>
            `;
            return;
        }

        qrs.forEach(qr => {

            qrList.innerHTML += `
                <div class="book-card">

                    <div class="book-icon">🔗</div>

                    <h3>${qr.title || ""}</h3>

                    <div class="qr-description">
                        ${qr.description || "بدون وصف"}
                    </div>

                    <div class="qr-link-badge">
                        🌐 رابط مرفق
                    </div>

                    <div class="book-actions">

                        <button class="action-btn edit-btn" data-edit="${qr.id}">
                            ✏️ تعديل
                        </button>

                        <button class="action-btn delete-btn" data-delete="${qr.id}">
                            🗑 حذف
                        </button>

                    </div>

                    <button class="book-btn" data-open="${qr.id}">
                        📖 فتح
                    </button>

                </div>
            `;
        });
    }

    /* ======================
       CLICK HANDLER
    ====================== */
    qrList.addEventListener("click", function (e) {

        const editId = e.target.dataset.edit;
        const deleteId = e.target.dataset.delete;
        const openId = e.target.dataset.open;

        if (editId) editQr(Number(editId));
        if (deleteId) deleteQr(Number(deleteId));

        if (openId) {
            window.location.href = "create.html?book=" + bookId + "&qr=" + openId;
        }
    });

    /* ======================
       ADD QR
    ====================== */
    addQrBtn.addEventListener("click", function () {

        editQrId = null;

        qrTitleInput.value = "";
        qrDescriptionInput.value = "";
        qrLinkInput.value = "";

        addQrModal.classList.add("show");
    });

    cancelQrBtn.addEventListener("click", () => {
        addQrModal.classList.remove("show");
    });

    /* ======================
       EDIT QR
    ====================== */
    function editQr(qrId) {

        const qr = currentBook.qrs.find(q => q.id === qrId);
        if (!qr) return;

        editQrId = qrId;

        qrTitleInput.value = qr.title || "";
        qrDescriptionInput.value = qr.description || "";
        qrLinkInput.value = qr.content || "";

        addQrModal.classList.add("show");
    }

    /* ======================
       SAVE QR (FIREBASE)
    ====================== */
    saveQrBtn.addEventListener("click", async function () {

        const title = qrTitleInput.value.trim();
        const description = qrDescriptionInput.value.trim();
        const link = qrLinkInput.value.trim();

        if (!title || !link) return;

        const bookIndex = books.findIndex(b => b.id === bookId);
        if (bookIndex === -1) return;

        if (!books[bookIndex].qrs) books[bookIndex].qrs = [];

        if (editQrId) {

            const index = books[bookIndex].qrs.findIndex(q => q.id === editQrId);

            if (index !== -1) {
                books[bookIndex].qrs[index] = {
                    id: editQrId,
                    title,
                    description,
                    content: link
                };
            }

        } else {

            books[bookIndex].qrs.push({
                id: Date.now(),
                title,
                description,
                content: link
            });
        }

        books[bookIndex].count = books[bookIndex].qrs.length;

        await setDoc(bookRef, { books });

        addQrModal.classList.remove("show");
        editQrId = null;
    });

    /* ======================
       DELETE QR
    ====================== */
    function deleteQr(qrId) {
        deleteQrId = qrId;
        deleteQrModal.classList.add("show");
    }

    cancelDeleteQrBtn.addEventListener("click", () => {
        deleteQrModal.classList.remove("show");
        deleteQrId = null;
    });

    confirmDeleteQrBtn.addEventListener("click", async function () {

        const bookIndex = books.findIndex(b => b.id === bookId);
        if (bookIndex === -1) return;

        books[bookIndex].qrs =
            books[bookIndex].qrs.filter(q => q.id !== deleteQrId);

        books[bookIndex].count = books[bookIndex].qrs.length;

        await setDoc(bookRef, { books });

        deleteQrModal.classList.remove("show");
        deleteQrId = null;
    });

    /* ======================
       ADD QR OPEN
    ====================== */
    addQrBtn.addEventListener("click", function () {

        editQrId = null;

        qrTitleInput.value = "";
        qrDescriptionInput.value = "";
        qrLinkInput.value = "";

        addQrModal.classList.add("show");
    });

});
