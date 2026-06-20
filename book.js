document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const bookId = Number(params.get("id"));

    const addQrBtn = document.getElementById("addQrBtn");
    const addQrModal = document.getElementById("addQrModal");
    const qrTitleInput = document.getElementById("qrTitleInput");
    const qrLinkInput = document.getElementById("qrLinkInput");
    const saveQrBtn = document.getElementById("saveQrBtn");
    const cancelQrBtn = document.getElementById("cancelQrBtn");

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
                        <button class="action-btn edit-btn">✏️ تعديل</button>
                        <button class="action-btn delete-btn">🗑 حذف</button>
                    </div>

                    <button class="book-btn">📖 فتح</button>
                </div>
            `;
        });
    }

    if (addQrBtn) {
        addQrBtn.addEventListener("click", function () {
            qrTitleInput.value = "";
            qrLinkInput.value = "";
            addQrModal.classList.add("show");
        });
    }

    if (cancelQrBtn) {
        cancelQrBtn.addEventListener("click", function () {
            addQrModal.classList.remove("show");
        });
    }

    if (saveQrBtn) {
        saveQrBtn.addEventListener("click", function () {
            const title = qrTitleInput.value.trim();
            const link = qrLinkInput.value.trim();

            if (!title || !link) return;

            const books = getBooks();
            const index = books.findIndex(book => book.id === bookId);

            if (index === -1) return;

            if (!books[index].qrs) {
                books[index].qrs = [];
            }

            books[index].qrs.push({
                id: Date.now(),
                title: title,
                content: link
            });

            books[index].count = books[index].qrs.length;

            saveBooks(books);

            addQrModal.classList.remove("show");

            updateHeader();
            renderQrList();
        });
    }

    updateHeader();
    renderQrList();

});
