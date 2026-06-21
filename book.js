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

    function getBooks() {
        return JSON.parse(localStorage.getItem("atqn_books") || "[]");
    }

    function saveBooks(books) {
        localStorage.setItem("atqn_books", JSON.stringify(books));
    }

    function getBook() {
        return getBooks().find(b => b.id === bookId);
    }

    function updateHeader() {
        const book = getBook();
        if (!book) return;

        document.getElementById("bookTitle").textContent = book.title;
        document.getElementById("bookCount").textContent =
            "عدد الأكواد: " + (book.qrs?.length || 0);
    }

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
                        🌐 ${qr.content || ""}
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

    // =========================
    // EVENTS (CLICK DELEGATION FIXED)
    // =========================
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

    function editQr(qrId) {

        const book = getBook();
        if (!book?.qrs) return;

        const qr = book.qrs.find(q => q.id === qrId);
        if (!qr) return;

        editQrId = qrId;

        addQrModal.querySelector("h3").textContent = "تعديل QR";
        saveQrBtn.textContent = "حفظ";

        qrTitleInput.value = qr.title || "";
        qrDescriptionInput.value = qr.description || "";
        qrLinkInput.value = qr.content || "";

        addQrModal.classList.add("show");
    }

    function deleteQr(qrId) {
        deleteQrId = qrId;
        deleteQrModal.classList.add("show");
    }

    // =========================
    // ADD QR
    // =========================
    addQrBtn.addEventListener("click", function () {

        editQrId = null;

        addQrModal.querySelector("h3").textContent = "إضافة QR جديد";
        saveQrBtn.textContent = "حفظ";

        qrTitleInput.value = "";
        qrDescriptionInput.value = "";
        qrLinkInput.value = "";

        addQrModal.classList.add("show");
    });

    cancelQrBtn.addEventListener("click", function () {
        addQrModal.classList.remove("show");
        editQrId = null;
    });

    // =========================
    // SAVE (FIXED FINAL)
    // =========================
    saveQrBtn.addEventListener("click", function () {

        const title = qrTitleInput.value.trim();
        const description = qrDescriptionInput.value.trim();
        const link = qrLinkInput.value.trim();

        if (!title || !link) {
            alert("يرجى تعبئة البيانات");
            return;
        }

        let books = getBooks();
        const bookIndex = books.findIndex(b => b.id === bookId);

        if (bookIndex === -1) return;

        if (!books[bookIndex].qrs) books[bookIndex].qrs = [];

        if (editQrId) {

            const qrIndex = books[bookIndex].qrs.findIndex(q => q.id === editQrId);

            if (qrIndex !== -1) {
                books[bookIndex].qrs[qrIndex] = {
                    ...books[bookIndex].qrs[qrIndex],
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

        saveBooks(books);

        addQrModal.classList.remove("show");
        editQrId = null;

        updateHeader();
        renderQrList();
    });

    // =========================
    // DELETE
    // =========================
    cancelDeleteQrBtn.addEventListener("click", function () {
        deleteQrModal.classList.remove("show");
        deleteQrId = null;
    });

    confirmDeleteQrBtn.addEventListener("click", function () {

        if (!deleteQrId) return;

        let books = getBooks();
        const bookIndex = books.findIndex(b => b.id === bookId);

        if (bookIndex === -1) return;

        books[bookIndex].qrs =
            books[bookIndex].qrs.filter(q => q.id !== deleteQrId);

        books[bookIndex].count = books[bookIndex].qrs.length;

        saveBooks(books);

        deleteQrModal.classList.remove("show");
        deleteQrId = null;

        updateHeader();
        renderQrList();
    });

    // =========================
    // INIT
    // =========================
    updateHeader();
    renderQrList();

});
