let deleteBookId = null;

/* ======================
   DEFAULT DATA (first run only)
====================== */

const defaultBooks = [
    { id:1, title:"كتاب المدود", icon:"📘", count:24 },
    { id:2, title:"كتاب الهمزات", icon:"📗", count:18 },
    { id:3, title:"كتاب التنوين", icon:"📙", count:35 },
    { id:4, title:"كتاب الشدة", icon:"📕", count:12 },
    { id:5, title:"كتاب السكون", icon:"📔", count:16 },
    { id:6, title:"كتاب التفخيم", icon:"📓", count:21 },
    { id:7, title:"كتاب الترقيق", icon:"📚", count:19 },
    { id:8, title:"كتاب المخارج", icon:"📒", count:27 },
    { id:9, title:"كتاب الصفات", icon:"📖", count:14 },
    { id:10, title:"كتاب الوقف والابتداء", icon:"📑", count:31 }
];

/* ======================
   FIREBASE INIT (SAFE)
====================== */

const db = window.db;
const fs = window.firebaseFirestore || {};
const { doc, setDoc, onSnapshot } = fs;

const BOOKS_REF = db && doc ? doc(db, "books", "main") : null;

/* ======================
   LOAD BOOKS (fallback)
====================== */

function getBooks() {
    const saved = localStorage.getItem("atqn_books");

    if (!saved) {
        localStorage.setItem("atqn_books", JSON.stringify(defaultBooks));
        return defaultBooks;
    }

    try {
        return JSON.parse(saved);
    } catch (e) {
        return defaultBooks;
    }
}

/* ======================
   SAVE BOOKS (LOCAL + FIREBASE)
====================== */

function saveBooks(books) {

    localStorage.setItem("atqn_books", JSON.stringify(books));

    // 🔥 write to firebase
    try {
        if (BOOKS_REF && setDoc) {
            setDoc(BOOKS_REF, { books });
        }
    } catch (e) {
        console.warn("Firebase write error:", e);
    }
}

/* ======================
   REALTIME SYNC (READ)
====================== */

if (BOOKS_REF && onSnapshot) {

    onSnapshot(BOOKS_REF, (snap) => {

        if (!snap.exists()) return;

        const data = snap.data();

        if (!data.books) return;

        localStorage.setItem("atqn_books", JSON.stringify(data.books));

        renderBooks();

        console.log("🔥 Sync active (real-time)");
    });
}

/* ======================
   RENDER UI
====================== */

function renderBooks() {

    const booksGrid = document.getElementById("booksGrid");
    if (!booksGrid) return;

    const books = getBooks();

    booksGrid.innerHTML = "";

    books.forEach(book => {

        booksGrid.innerHTML += `
<div class="book-card">

    <div class="book-icon">${book.icon}</div>

    <h3>${book.title}</h3>

    <div class="book-count">${book.count} QR</div>

    <div class="book-actions">

        <button class="action-btn edit-btn" onclick="editBook(${book.id})">
            ✏️ تعديل
        </button>

        <button class="action-btn delete-btn" onclick="deleteBook(${book.id})">
            🗑 حذف
        </button>

    </div>

    <button class="book-btn" onclick="openBook(${book.id})">
        📖 فتح الكتاب
    </button>

</div>
`;
    });
}

/* ======================
   DELETE
====================== */

function deleteBook(id) {
    deleteBookId = id;
    document.getElementById("deleteModal")?.classList.add("show");
}

/* ======================
   INIT
====================== */

document.addEventListener("DOMContentLoaded", function () {

    renderBooks();

    const modal = document.getElementById("deleteModal");

    document.getElementById("cancelDeleteBtn")?.addEventListener("click", function () {
        modal?.classList.remove("show");
        deleteBookId = null;
    });

    document.getElementById("confirmDeleteBtn")?.addEventListener("click", function () {

        if (deleteBookId === null) return;

        let books = getBooks();

        books = books.filter(b => b.id !== deleteBookId);

        saveBooks(books);

        modal?.classList.remove("show");

        deleteBookId = null;

        renderBooks();
    });

});

/* ======================
   ADD / EDIT
====================== */

let currentEditId = null;

function editBook(id) {

    const books = getBooks();
    const book = books.find(b => b.id === id);

    if (!book) return;

    currentEditId = id;

    document.getElementById("editBookTitle").value = book.title;
    document.getElementById("editModal").classList.add("show");
}

/* SAVE EDIT */
document.getElementById("saveEditBtn")?.addEventListener("click", function () {

    const title = document.getElementById("editBookTitle")?.value.trim();
    if (!title) return;

    let books = getBooks();

    const index = books.findIndex(b => b.id === currentEditId);
    if (index === -1) return;

    books[index].title = title;

    saveBooks(books);
    renderBooks();

    document.getElementById("editModal")?.classList.remove("show");
});

/* ADD BOOK */
document.getElementById("saveAddBtn")?.addEventListener("click", function () {

    const title = document.getElementById("newBookTitle")?.value.trim();
    if (!title) return;

    let books = getBooks();

    books.push({
        id: Date.now(),
        title,
        icon: "📘",
        count: 0
    });

    saveBooks(books);
    renderBooks();

    document.getElementById("addModal")?.classList.remove("show");
});

/* CLOSE MODALS */
document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
    document.getElementById("editModal")?.classList.remove("show");
});

document.getElementById("cancelAddBtn")?.addEventListener("click", () => {
    document.getElementById("addModal")?.classList.remove("show");
});

/* OPEN */
function openBook(id) {
    window.location.href = "book.html?id=" + id;
}
