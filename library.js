function listenFirebase(callback) {

    if (!window.db || !window.firebaseFirestore) return;

    const fs = window.firebaseFirestore;

    if (!fs.doc || !fs.onSnapshot) return;

    const ref = fs.doc(window.db, "books/main");

    fs.onSnapshot(ref, (snap) => {

        try {
            if (!snap || !snap.exists()) return;

            const data = snap.data();

            if (data?.books) {
                callback(data.books);
            }

        } catch (e) {
            console.warn("listenFirebase error:", e);
        }
    });
}

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

/* ======================
   LOCAL STORAGE (CACHE ONLY)
====================== */

function getBooks() {
    try {
        const saved = localStorage.getItem("atqn_books");

        if (!saved) {
            localStorage.setItem("atqn_books", JSON.stringify(defaultBooks));
            return defaultBooks;
        }

        return JSON.parse(saved) || defaultBooks;

    } catch (e) {
        console.warn("Parse error:", e);
        return defaultBooks;
    }
}

function saveBooks(books) {
    localStorage.setItem("atqn_books", JSON.stringify(books));
}

/* ======================
   🔥 FIREBASE SYNC (SOURCE OF TRUTH)
====================== */

function syncToFirebase(books) {
    try {

        if (!window.db || !window.firebaseFirestore) return;

        const fs = window.firebaseFirestore;

        if (!fs.doc || !fs.setDoc) return;

        const ref = fs.doc(window.db, "books/main");

        fs.setDoc(ref, {
            books: books,
            updatedAt: Date.now()
        })
        .then(() => {
            console.log("✅ saved to firebase");
        })
        .catch((err) => {
            console.warn("Firebase write failed:", err);
        });

    } catch (e) {
        console.error("sync crash:", e);
    }
}

/* ======================
   SAFE MERGE (REAL FIX)
====================== */

function mergeBooks(local, remote) {

    if (!Array.isArray(remote)) return local;
    if (!Array.isArray(local)) return remote;

    const map = new Map();

    // remote أولاً (مصدر الحقيقة)
    remote.forEach(b => map.set(b.id, b));

    // local فقط لإضافة الجديد غير الموجود في remote
    local.forEach(b => {
        if (!map.has(b.id)) {
            map.set(b.id, b);
        }
    });

    return Array.from(map.values());
}

/* ======================
   RENDER
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
   INIT (STABLE REALTIME)
====================== */

document.addEventListener("DOMContentLoaded", function () {

    renderBooks();

    listenFirebase((remoteBooks) => {

        const local = getBooks();

        const merged = mergeBooks(local, remoteBooks);

        saveBooks(merged);

        renderBooks();
    });

    const modal = document.getElementById("deleteModal");

    document.getElementById("cancelDeleteBtn")?.addEventListener("click", function () {
        modal?.classList.remove("show");
        deleteBookId = null;
    });

    document.getElementById("confirmDeleteBtn")?.addEventListener("click", function () {

        if (deleteBookId === null) return;

        let books = getBooks();

        books = books.filter(book => book.id !== deleteBookId);

        saveBooks(books);

        syncToFirebase(books);

        modal?.classList.remove("show");

        deleteBookId = null;

        renderBooks();
    });

});

/* ======================
   ADD BOOK
====================== */

document.querySelector(".add-book-btn")?.addEventListener("click", function () {
    document.getElementById("newBookTitle").value = "";
    document.getElementById("addModal").classList.add("show");
});

function addBook() {
    document.getElementById("newBookTitle").value = "";
    document.getElementById("addModal").classList.add("show");
}

/* ======================
   EDIT BOOK
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

/* ======================
   SAVE EDIT
====================== */

document.getElementById("saveEditBtn")?.addEventListener("click", function () {

    const newTitle = document.getElementById("editBookTitle")?.value.trim();
    if (!newTitle) return;

    let books = getBooks();

    const index = books.findIndex(b => b.id === currentEditId);
    if (index === -1) return;

    books[index].title = newTitle;

    saveBooks(books);
    syncToFirebase(books);

    renderBooks();

    document.getElementById("editModal")?.classList.remove("show");
});

/* ======================
   SAVE ADD
====================== */

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
    syncToFirebase(books);

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
