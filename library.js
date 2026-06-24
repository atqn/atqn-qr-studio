let deleteBookId = null;

/* ======================
   FIREBASE SETUP
====================== */
const db = window.db;
const fs = window.firebaseFirestore || {};
const { doc, setDoc, onSnapshot, deleteDoc } = fs;

/* ======================
   DEFAULT BOOKS (FIRST TIME ONLY)
====================== */
const defaultBooks = [
    { id: 1, title: "كتاب المدود", icon: "📘", count: 24, qrs: [] },
    { id: 2, title: "كتاب الهمزات", icon: "📗", count: 18, qrs: [] },
    { id: 3, title: "كتاب التنوين", icon: "📙", count: 35, qrs: [] },
    { id: 4, title: "كتاب الشدة", icon: "📕", count: 12, qrs: [] },
    { id: 5, title: "كتاب السكون", icon: "📔", count: 16, qrs: [] },
    { id: 6, title: "كتاب التفخيم", icon: "📓", count: 21, qrs: [] },
    { id: 7, title: "كتاب الترقيق", icon: "📚", count: 19, qrs: [] },
    { id: 8, title: "كتاب المخارج", icon: "📒", count: 27, qrs: [] },
    { id: 9, title: "كتاب الصفات", icon: "📖", count: 14, qrs: [] },
    { id: 10, title: "كتاب الوقف والابتداء", icon: "📑", count: 31, qrs: [] }
];

/* ======================
   STATE
====================== */
let books = [];

/* ======================
   LOAD FROM FIREBASE (REALTIME)
====================== */
function initRealtime() {

    const booksRef = doc(db, "books", "global");

    onSnapshot(booksRef, (snap) => {

        if (!snap.exists()) {
            // أول تشغيل: نرفع الديفولت
            setDoc(booksRef, { books: defaultBooks });
            books = defaultBooks;
        } else {
            books = snap.data().books || [];
        }

        renderBooks();
    });
}

/* ======================
   SAVE TO FIREBASE
====================== */
async function saveToFirebase() {

    const booksRef = doc(db, "books", "global");

    try {
        await setDoc(booksRef, { books });
    } catch (e) {
        console.warn("Firebase save error:", e);
    }
}

/* ======================
   RENDER
====================== */
function renderBooks() {

    const booksGrid = document.getElementById("booksGrid");
    if (!booksGrid) return;

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
   DELETE BOOK
====================== */
function deleteBook(id) {
    deleteBookId = id;
    document.getElementById("deleteModal")?.classList.add("show");
}

/* ======================
   INIT
====================== */
document.addEventListener("DOMContentLoaded", function () {

    initRealtime();

    const modal = document.getElementById("deleteModal");

    document.getElementById("cancelDeleteBtn")?.addEventListener("click", function () {
        modal?.classList.remove("show");
        deleteBookId = null;
    });

    document.getElementById("confirmDeleteBtn")?.addEventListener("click", async function () {

        if (deleteBookId === null) return;

        books = books.filter(book => book.id !== deleteBookId);

        await saveToFirebase();

        modal?.classList.remove("show");
        deleteBookId = null;
    });

});

/* ======================
   ADD BOOK
====================== */
document.querySelector(".add-book-btn")?.addEventListener("click", function () {
    document.getElementById("newBookTitle").value = "";
    document.getElementById("addModal").classList.add("show");
});

document.getElementById("saveAddBtn")?.addEventListener("click", async function () {

    const title = document.getElementById("newBookTitle")?.value.trim();
    if (!title) return;

    books.push({
        id: Date.now(),
        title,
        icon: "📘",
        count: 0,
        qrs: []
    });

    await saveToFirebase();

    document.getElementById("addModal")?.classList.remove("show");
});

/* ======================
   EDIT BOOK
====================== */
let currentEditId = null;

function editBook(id) {

    const book = books.find(b => b.id === id);
    if (!book) return;

    currentEditId = id;

    document.getElementById("editBookTitle").value = book.title;
    document.getElementById("editModal").classList.add("show");
}

document.getElementById("saveEditBtn")?.addEventListener("click", async function () {

    const newTitle = document.getElementById("editBookTitle")?.value.trim();
    if (!newTitle) return;

    const index = books.findIndex(b => b.id === currentEditId);
    if (index === -1) return;

    books[index].title = newTitle;

    await saveToFirebase();

    document.getElementById("editModal")?.classList.remove("show");
});

/* ======================
   CLOSE MODALS
====================== */
document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
    document.getElementById("editModal")?.classList.remove("show");
});

document.getElementById("cancelAddBtn")?.addEventListener("click", () => {
    document.getElementById("addModal")?.classList.remove("show");
});

/* ======================
   OPEN BOOK
====================== */
function openBook(id) {
    window.location.href = "book.html?id=" + id;
}
