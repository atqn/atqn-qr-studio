const params =
    new URLSearchParams(
        window.location.search
    );

const bookId =
    Number(
        params.get("id")
    );

const books =
    JSON.parse(
        localStorage.getItem(
            "atqn_books"
        )
    ) || [];

const book =
    books.find(
        b => b.id === bookId
    );

if (book) {

    document.getElementById(
        "bookTitle"
    ).textContent =
        book.title;

    document.getElementById(
        "bookCount"
    ).textContent =
        "عدد الأكواد: " +
        book.count;
}

renderQrList();

function renderQrList() {

    const qrList =
        document.getElementById(
            "qrList"
        );

    if (!qrList) return;

    qrList.innerHTML = `

<div class="book-card">

    <h3>
        QR 001
    </h3>

    <div class="book-actions">

        <button
            class="action-btn edit-btn">

            ✏️ تعديل

        </button>

        <button
            class="action-btn delete-btn">

            🗑 حذف

        </button>

    </div>

    <button
        class="book-btn">

        📖 فتح

    </button>

</div>

<div class="book-card">

    <h3>
        QR 002
    </h3>

    <div class="book-actions">

        <button
            class="action-btn edit-btn">

            ✏️ تعديل

        </button>

        <button
            class="action-btn delete-btn">

            🗑 حذف

        </button>

    </div>

    <button
        class="book-btn">

        📖 فتح

    </button>

</div>

`;
}
