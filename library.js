const db = window.db;
const { doc, onSnapshot } = window.firebaseFirestore;

const booksGrid = document.getElementById("booksGrid");

function renderBooks(books) {

    if (!booksGrid) return;

    booksGrid.innerHTML = "";

    books.forEach(book => {

        booksGrid.innerHTML += `
        <div class="book-card">

            <div class="book-icon">${book.icon || "📘"}</div>

            <h3>${book.title}</h3>

            <div class="book-count">
                ${book.qrs ? book.qrs.length : 0} QR
            </div>

            <div class="book-actions">
                <button class="action-btn edit-btn" onclick="editBook(${book.id})">✏️ تعديل</button>
                <button class="action-btn delete-btn" onclick="deleteBook(${book.id})">🗑 حذف</button>
            </div>

            <button class="book-btn" onclick="openBook(${book.id})">
                📖 فتح الكتاب
            </button>

        </div>
        `;
    });
}

/* 🔥 REALTIME FIREBASE SYNC */
const ref = doc(db, "books", "main");

onSnapshot(ref, (snap) => {

    if (!snap.exists()) {
        renderBooks([]);
        return;
    }

    const data = snap.data();

    renderBooks(data.books || []);
});
