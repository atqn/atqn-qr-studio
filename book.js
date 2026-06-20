document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const bookId = Number(params.get("id"));

    let editQrId = null;
    let deleteQrId = null;

    const addQrBtn = document.getElementById("addQrBtn");
    const addQrModal = document.getElementById("addQrModal");
    const qrTitleInput = document.getElementById("qrTitleInput");
    const qrLinkInput = document.getElementById("qrLinkInput");
    const saveQrBtn = document.getElementById("saveQrBtn");
    const cancelQrBtn = document.getElementById("cancelQrBtn");

    const deleteQrModal = document.getElementById("deleteQrModal");
    const confirmDeleteQrBtn = document.getElementById("confirmDeleteQrBtn");
    const cancelDeleteQrBtn = document.getElementById("cancelDeleteQrBtn");

    function getBooks() {
        return JSON.parse(localStorage.getItem("atqn_books")) || [];
    }

    function saveBooks(books) {
        localStorage.setItem("atqn_books", JSON.stringify(books));
    }

    function getBook() {
        return getBooks().find(book => book.id === bookId);
    }

    function updateHeader() {
        const book = getBook();
        if (!book) return;

        document.getElementById("bookTitle").textContent = book.title;
        document.getElementById("bookCount").textContent =
            "عدد الأكواد: " + ((book.qrs && book.qrs.length) || 0);
    }

    function renderQrList() {
        const qrList = document.getElementById("qrList");
        const book = getBook();

        if (!qrList || !book) return;

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
                    <h3>${qr.title}</h3>
                    <div class="book-count">QR</div>

                    <div class="book-actions">
                        <button class="action-btn edit-btn" onclick="editQr(${qr.id})">✏️ تعديل</button>
                        <button class="action-btn delete-btn" onclick="deleteQr(${qr.id})">🗑 حذف</button>
                    </div>

                    <button class="book-btn" onclick="openQr(${bookId}, ${qr.id})">
                        📖 فتح
                    </button>
                </div>
            `;
        });
    }

    window.openQr = function (bookId, qrId) {
        window.location.href = "create.html?book=" + bookId + "&qr=" + qrId;
    };

    window.editQr = function (qrId) {
        const book = getBook();
        if (!book || !book.qrs) return;

        const qr = book.qrs.find(q => q.id === qrId);
        if (!qr) return;

        editQrId = qrId;

        addQrModal.querySelector("h3").textContent = "تعديل QR";
        saveQrBtn.textContent = "حفظ";

        qrTitleInput.value = qr.title;
        qrLinkInput.value = qr.content || "";

        addQrModal.classList.add("show");
    };

    window.deleteQr = function (qrId) {
        deleteQrId = qrId;
        deleteQrModal.classList.add("show");
    };

    addQrBtn.addEventListener("click", function () {
        editQrId = null;

        addQrModal.querySelector("h3").textContent = "إضافة QR جديد";
        saveQrBtn.textContent = "حفظ";

        qrTitleInput.value = "";
        qrLinkInput.value = "";

        addQrModal.classList.add("show");
    });

    cancelQrBtn.addEventListener("click", function () {
        addQrModal.classList.remove("show");
        editQrId = null;
    });

    saveQrBtn.addEventListener("click", function () {
        const title = qrTitleInput.value.trim();
        const link = qrLinkInput.value.trim();

        if (!title || !link) return;

        const books = getBooks();
        const bookIndex = books.findIndex(book => book.id === bookId);

        if (bookIndex === -1) return;

        if (!books[bookIndex].qrs) {
            books[bookIndex].qrs = [];
        }

        if (editQrId) {
            const qrIndex = books[bookIndex].qrs.findIndex(qr => qr.id === editQrId);

            if (qrIndex !== -1) {
                books[bookIndex].qrs[qrIndex].title = title;
                books[bookIndex].qrs[qrIndex].content = link;
            }
        } else {
            books[bookIndex].qrs.push({
                id: Date.now(),
                title: title,
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

    cancelDeleteQrBtn.addEventListener("click", function () {
        deleteQrModal.classList.remove("show");
        deleteQrId = null;
    });

    confirmDeleteQrBtn.addEventListener("click", function () {
        if (!deleteQrId) return;

        const books = getBooks();
        const bookIndex = books.findIndex(book => book.id === bookId);

        if (bookIndex === -1 || !books[bookIndex].qrs) return;

        books[bookIndex].qrs = books[bookIndex].qrs.filter(qr => qr.id !== deleteQrId);
        books[bookIndex].count = books[bookIndex].qrs.length;

        saveBooks(books);

        deleteQrModal.classList.remove("show");
        deleteQrId = null;

        updateHeader();
        renderQrList();
    });

    updateHeader();
    renderQrList();

});
