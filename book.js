document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const bookId = Number(params.get("id"));

    let editQrId = null;
    let deleteQrId = null;

    const addQrBtn = document.getElementById("addQrBtn");
    const qrList = document.getElementById("qrList");

    const addQrModal = document.getElementById("addQrModal");
    const qrTitleInput = document.getElementById("qrTitleInput");
    const qrDescriptionInput = document.getElementById("qrDescriptionInput");
    const qrLinkInput = document.getElementById("qrLinkInput");

    const saveQrBtn = document.getElementById("saveQrBtn");
    const cancelQrBtn = document.getElementById("cancelQrBtn");

    const deleteQrModal = document.getElementById("deleteQrModal");
    const confirmDeleteQrBtn = document.getElementById("confirmDeleteQrBtn");
    const cancelDeleteQrBtn = document.getElementById("cancelDeleteQrBtn");

    /* =========================
       FIREBASE (SOURCE OF TRUTH)
    ========================= */

    function getRef() {
        if (!window.db || !window.firebaseFirestore) return null;
        return window.firebaseFirestore.doc(window.db, "books", "global");
    }

    let books = [];

    function loadFromFirebase() {
        const ref = getRef();
        if (!ref) return;

        window.firebaseFirestore.onSnapshot(ref, (snap) => {

            if (!snap.exists()) return;

            const data = snap.data();
            if (!Array.isArray(data.books)) return;

            books = data.books;

            renderQrList();
            updateHeader();
        });
    }

    function saveToFirebase() {
        const ref = getRef();
        if (!ref) return;

        window.firebaseFirestore.setDoc(ref, {
            books,
            updatedAt: Date.now()
        });
    }

    function getBook() {
        return books.find(b => b.id === bookId);
    }

    /* =========================
       HEADER
    ========================= */

    function updateHeader() {
        const book = getBook();
        if (!book) return;

        document.getElementById("bookTitle").textContent = book.title || "";
        document.getElementById("bookCount").textContent =
            "عدد الأكواد: " + (book.qrs?.length || 0);
    }

    /* =========================
       RENDER
    ========================= */

    function renderQrList() {

        const book = getBook();
        if (!book || !qrList) return;

        const qrs = book.qrs || [];
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

    /* =========================
       CLICK HANDLER
    ========================= */

    qrList.addEventListener("click", function (e) {

        const editId = e.target.dataset.edit;
        const deleteId = e.target.dataset.delete;
        const openId = e.target.dataset.open;

        if (editId) editQr(Number(editId));
        if (deleteId) deleteQr(Number(deleteId));

        if (openId) {
            window.location.href =
                "create.html?book=" + bookId + "&qr=" + openId;
        }
    });

    /* =========================
       EDIT (FIXED SAFE MATCH)
    ========================= */

    function editQr(qrId) {

        const book = getBook();
        if (!book?.qrs) return;

        const qr = book.qrs.find(q => Number(q.id) === Number(qrId));
        if (!qr) return;

        editQrId = qrId;

        addQrModal.querySelector("h3").textContent = "تعديل QR";

        qrTitleInput.value = qr.title || "";
        qrDescriptionInput.value = qr.description || "";
        qrLinkInput.value = qr.content || "";

        addQrModal.classList.add("show");
    }

    /* =========================
       DELETE
    ========================= */

    function deleteQr(qrId) {
        deleteQrId = qrId;
        deleteQrModal.classList.add("show");
    }

    cancelDeleteQrBtn.addEventListener("click", () => {
        deleteQrModal.classList.remove("show");
        deleteQrId = null;
    });

    confirmDeleteQrBtn.addEventListener("click", () => {

        const book = getBook();
        if (!book) return;

        book.qrs = (book.qrs || []).filter(q => Number(q.id) !== Number(deleteQrId));

        saveToFirebase();

        deleteQrModal.classList.remove("show");
        deleteQrId = null;

        renderQrList();
        updateHeader();
    });

    /* =========================
       ADD NEW
    ========================= */

    addQrBtn.addEventListener("click", () => {

        editQrId = null;

        qrTitleInput.value = "";
        qrDescriptionInput.value = "";
        qrLinkInput.value = "";

        addQrModal.classList.add("show");
    });

    cancelQrBtn.addEventListener("click", () => {
        addQrModal.classList.remove("show");
        editQrId = null;
    });

    /* =========================
       SAVE (FIXED FINAL)
    ========================= */

    saveQrBtn.addEventListener("click", () => {

        const title = qrTitleInput.value.trim();
        const description = qrDescriptionInput.value.trim();
        const link = qrLinkInput.value.trim();

        if (!title || !link) {
            alert("يرجى تعبئة البيانات");
            return;
        }

        const book = getBook();
        if (!book) return;

        if (!book.qrs) book.qrs = [];

        if (editQrId) {

            const index = book.qrs.findIndex(q => Number(q.id) === Number(editQrId));

            if (index !== -1) {
                book.qrs[index] = {
                    ...book.qrs[index],
                    title,
                    description,
                    content: link
                };
            }

        } else {

            book.qrs.push({
                id: Date.now(),
                title,
                description,
                content: link
            });
        }

        book.count = book.qrs.length;

        saveToFirebase();

        addQrModal.classList.remove("show");
        editQrId = null;

        updateHeader();
        renderQrList();
    });

    /* =========================
       INIT
    ========================= */

    loadFromFirebase();

});
