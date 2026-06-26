import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

let books = [];
let editBookId = null;
let deleteBookId = null;

const booksGrid = document.getElementById("booksGrid");

/* ======================
   SKELETON LOADING (بسيط)
====================== */
booksGrid.innerHTML = `
    <div class="book-card">
        <div class="book-icon">⏳</div>
        <h3>جاري تحميل الكتب...</h3>
        <div class="book-count">...</div>
    </div>
`;

const addBookBtn = document.getElementById("addBookBtn");
const bookModal = document.getElementById("bookModal");
const bookModalTitle = document.getElementById("bookModalTitle");
const bookTitleInput = document.getElementById("bookTitleInput");
const saveBookBtn = document.getElementById("saveBookBtn");
const cancelBookBtn = document.getElementById("cancelBookBtn");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

async function ensureDatabase() {
    const snap = await getDoc(booksRef);

    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

function saveBooks() {
    return setDoc(booksRef, { books });
}

/* ======================
   RENDER (محسن بدون flicker)
====================== */
function renderBooks() {

    if (!books) return;

    let html = "";

    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div class="book-card">
                <div class="book-icon">📚</div>
                <h3>لا توجد كتب بعد</h3>
                <div class="book-count">اضغط على إضافة كتاب</div>
            </div>
        `;
        return;
    }

    for (const book of books) {

        const count = (book.qrs || []).length;

        html += `
            <div class="book-card">

                <div class="book-icon">${book.icon || "📘"}</div>

                <h3>${book.title || ""}</h3>

                <div class="book-count">${count} QR</div>

                <div class="book-actions">
                    <button class="action-btn edit-btn" data-edit="${book.id}">
                        ✏️ تعديل
                    </button>

                    <button class="action-btn delete-btn" data-delete="${book.id}">
                        🗑 حذف
                    </button>
                </div>

                <button class="book-btn" data-open="${book.id}">
                    📖 فتح الكتاب
                </button>

            </div>
        `;
    }

    requestAnimationFrame(() => {
        booksGrid.innerHTML = html;
    });
}

/* ======================
   MODALS (بدون تغيير)
====================== */
function openBookModal(mode, book = null) {
    editBookId = book ? book.id : null;

    bookModalTitle.textContent = mode === "edit" ? "تعديل الكتاب" : "إضافة كتاب";
    bookTitleInput.value = book?.title || "";

    bookModal.classList.add("show");
    bookTitleInput.focus();
}

function closeBookModal() {
    editBookId = null;
    bookTitleInput.value = "";
    bookModal.classList.remove("show");
}

addBookBtn.addEventListener("click", () => openBookModal("add"));
cancelBookBtn.addEventListener("click", closeBookModal);

saveBookBtn.addEventListener("click", async () => {

    const title = bookTitleInput.value.trim();
    if (!title) return;

    if (editBookId) {

        const index = books.findIndex((b) => b.id === editBookId);

        if (index !== -1) {
            books[index].title = title;
        }

    } else {

        books.push({
            id: Date.now(),
            title,
            icon: "📘",
            qrs: []
        });
    }

    await saveBooks();
    closeBookModal();
});

/* ======================
   CLICK HANDLER
====================== */
booksGrid.addEventListener("click", (event) => {

    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;
    const openId = event.target.dataset.open;

    if (editId) {
        const book = books.find((b) => b.id === Number(editId));
        if (book) openBookModal("edit", book);
    }

    if (deleteId) {
        deleteBookId = Number(deleteId);
        deleteModal.classList.add("show");
    }

    if (openId) {
        window.location.href = `book.html?id=${openId}`;
    }
});

/* ======================
   DELETE
====================== */
cancelDeleteBtn.addEventListener("click", () => {
    deleteBookId = null;
    deleteModal.classList.remove("show");
});

confirmDeleteBtn.addEventListener("click", async () => {

    if (!deleteBookId) return;

    books = books.filter((book) => book.id !== deleteBookId);

    await saveBooks();

    deleteBookId = null;
    deleteModal.classList.remove("show");
});

/* ======================
   INIT DB + REALTIME
====================== */
ensureDatabase();

onSnapshot(booksRef, (snap) => {

    const data = snap.data();
    books = data?.books || [];

    renderBooks();
});
