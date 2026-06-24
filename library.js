let deleteBookId = null;

const db = window.db;
const fs = window.firebaseFirestore || {};
const { doc, setDoc, onSnapshot } = fs;

/* ======================
   STATE
====================== */
let books = [];

/* ======================
   FIREBASE REFERENCE
====================== */
const booksRef = doc(db, "books", "global");

/* ======================
   MIGRATION (LOCALSTORAGE → FIREBASE ONCE)
====================== */
(function migrateIfNeeded() {

    const old = localStorage.getItem("atqn_books");

    if (old) {
        try {
            const parsed = JSON.parse(old);

            setDoc(booksRef, {
                books: parsed
            });

            localStorage.removeItem("atqn_books");

        } catch (e) {
            console.warn("Migration error:", e);
        }
    }
})();

/* ======================
   REALTIME SYNC
====================== */
onSnapshot(booksRef, (snap) => {

    if (!snap.exists()) {
        setDoc(booksRef, { books: [] });
        return;
    }

    books = snap.data().books || [];

    renderBooks();
});

/* ======================
   RENDER BOOKS
====================== */
function renderBooks() {

    const booksGrid = document.getElementById("booksGrid");
    if (!booksGrid) return;

    booksGrid.innerHTML = "";

    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div class="book-card">
                <h3>لا توجد كتب</h3>
                <div class="book-count">اضغط إضافة كتاب جديد</div>
            </div>
        `;
        return;
    }

    books.forEach(book => {

        booksGrid.innerHTML += `
        <div class="book-card">

            <div class="book-icon">${book.icon || "📘"}</div>

            <h3>${book.title}</h3>

            <div class="book-count">${book.count || 0} QR</div>

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

    renderBooks();

    const modal = document.getElementById("deleteModal");

    document.getElementById("cancelDeleteBtn")?.addEventListener("click", function () {
        modal?.classList.remove("show");
        deleteBookId = null;
    });

    document.getElementById("confirmDeleteBtn")?.addEventListener("click", async function () {

        if (deleteBookId === null) return;

        books = books.filter(b => b.id !== deleteBookId);

        await setDoc(booksRef, { books });

        modal?.classList.remove("show");
        deleteBookId = null;
    });

});

/* ======================
   ➕ ADD BOOK (FIXED BUTTON)
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

    await setDoc(booksRef, { books });

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

    await setDoc(booksRef, { books });

    document.getElementById("editModal").classList.remove("show");
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
