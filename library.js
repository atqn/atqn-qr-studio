let deleteBookId = null;

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

function getBooks() {
    try {
        const saved = localStorage.getItem("atqn_books");

        if (!saved) {
            localStorage.setItem("atqn_books", JSON.stringify(defaultBooks));
            return defaultBooks;
        }

        return JSON.parse(saved) || defaultBooks;

    } catch (e) {
        console.warn("Books load error:", e);
        return defaultBooks;
    }
}

function saveBooks(books) {
    localStorage.setItem("atqn_books", JSON.stringify(books));
}

function renderBooks() {

    const booksGrid = document.getElementById("booksGrid");
    if (!booksGrid) return;

    const books = getBooks();

    booksGrid.innerHTML = "";

    books.forEach(book => {

        booksGrid.innerHTML += `
<div class="book-card">

    <div class="book-icon">
        ${book.icon}
    </div>

    <h3>${book.title}</h3>

    <div class="book-count">
        ${book.count} QR
    </div>

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

    console.log("Books Loaded:", books.length);
}

function deleteBook(id) {
    deleteBookId = id;

    const modal = document.getElementById("deleteModal");
    if (modal) modal.classList.add("show");
}

document.addEventListener("DOMContentLoaded", function () {

    renderBooks();

    const modal = document.getElementById("deleteModal");
    const cancelBtn = document.getElementById("cancelDeleteBtn");
    const confirmBtn = document.getElementById("confirmDeleteBtn");

    cancelBtn?.addEventListener("click", function () {
        modal?.classList.remove("show");
        deleteBookId = null;
    });

    confirmBtn?.addEventListener("click", function () {

        if (deleteBookId === null) return;

        let books = getBooks();

        books = books.filter(book => book.id !== deleteBookId);

        saveBooks(books);

        modal?.classList.remove("show");

        deleteBookId = null;

        renderBooks();
    });

});

/* ======================
   ADD BOOK
====================== */

const addBookBtn = document.querySelector(".add-book-btn");

if (addBookBtn) {
    addBookBtn.addEventListener("click", addBook);
}

function addBook() {

    const input = document.getElementById("newBookTitle");
    const modal = document.getElementById("addModal");

    if (input) input.value = "";
    if (modal) modal.classList.add("show");
}

let currentEditId = null;

function editBook(id) {

    const books = getBooks();
    const book = books.find(b => b.id === id);

    if (!book) return;

    currentEditId = id;

    const input = document.getElementById("editBookTitle");
    const modal = document.getElementById("editModal");

    if (input) input.value = book.title;
    if (modal) modal.classList.add("show");
}

/* ======================
   EDIT SAVE
====================== */

document.getElementById("saveEditBtn")?.addEventListener("click", function () {

    const input = document.getElementById("editBookTitle");

    const newTitle = input?.value?.trim();
    if (!newTitle) return;

    let books = getBooks();

    const index = books.findIndex(b => b.id === currentEditId);

    if (index === -1) return;

    books[index].title = newTitle;

    saveBooks(books);
    renderBooks();

    document.getElementById("editModal")?.classList.remove("show");
});

/* ======================
   ADD SAVE
====================== */

document.getElementById("saveAddBtn")?.addEventListener("click", function () {

    const input = document.getElementById("newBookTitle");
    const title = input?.value?.trim();

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
