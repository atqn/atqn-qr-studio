let deleteBookId = null;

/* ======================
   FIREBASE SAFE INIT
====================== */

function getFirebaseRef() {
    if (!window.db || !window.firebaseFirestore) return null;
    return window.firebaseFirestore.doc(window.db, "books", "global");
}

/* ======================
   DEFAULT FALLBACK
====================== */

const defaultBooks = [
    { id: 1, title: "كتاب المدود", icon: "📘", count: 24, qrs: [] },
    { id: 2, title: "كتاب الهمزات", icon: "📗", count: 18, qrs: [] },
    { id: 3, title: "كتاب التنوين", icon: "📙", count: 35, qrs: [] },
    { id: 4, title: "كتاب الشدة", icon: "📕", count: 12, qrs: [] }
];

/* ======================
   STATE
====================== */

let books = [];

/* ======================
   INIT
====================== */

function initBooks() {
    const saved = localStorage.getItem("atqn_books");

    if (saved) {
        try {
            books = JSON.parse(saved);
        } catch {
            books = defaultBooks;
        }
    } else {
        books = defaultBooks;
        localStorage.setItem("atqn_books", JSON.stringify(books));
    }
}

/* ======================
   SAVE LOCAL
====================== */

function saveLocal() {
    localStorage.setItem("atqn_books", JSON.stringify(books));
}

/* ======================
   🔥 FIXED MERGE (FINAL SAFE VERSION)
====================== */

function mergeBooks(local, remote) {

    const map = new Map();

    // local first (IMPORTANT)
    local.forEach(b => map.set(b.id, b));

    remote.forEach(r => {

        const existing = map.get(r.id);

        if (!existing) {
            map.set(r.id, {
                ...r,
                qrs: Array.isArray(r.qrs) ? r.qrs : []
            });
        } else {

            // 🔥 FIX: NEVER allow remote to override local qrs
            const localQrs = Array.isArray(existing.qrs) ? existing.qrs : [];
            const remoteQrs = Array.isArray(r.qrs) ? r.qrs : [];

            // merge qrs safely (no overwrite)
            const mergedQrs = [...localQrs];

            remoteQrs.forEach(qr => {

                const exists = mergedQrs.find(x => x.id === qr.id);

                if (!exists) {
                    mergedQrs.push(qr);
                }
            });

            map.set(r.id, {
                ...existing,
                ...r,
                qrs: mergedQrs
            });
        }
    });

    return Array.from(map.values());
}

/* ======================
   FIREBASE SYNC
====================== */

function syncFirebase() {
    const ref = getFirebaseRef();
    if (!ref) return;

    window.firebaseFirestore.setDoc(ref, {
        books,
        updatedAt: Date.now()
    });
}

/* ======================
   🔥 FIXED LISTENER (NO LOSS EVER)
====================== */

function listenFirebase() {
    const ref = getFirebaseRef();
    if (!ref) return;

    window.firebaseFirestore.onSnapshot(ref, (snap) => {

        if (!snap.exists()) return;

        const data = snap.data();

        if (!data || !Array.isArray(data.books)) return;

        const remoteBooks = data.books;

        // 🔥 FIX: safe merge (no overwrite)
        books = mergeBooks(books, remoteBooks);

        saveLocal();
        renderBooks();
    });
}

/* ======================
   RENDER
====================== */

function renderBooks() {
    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    grid.innerHTML = "";

    books.forEach(book => {
        grid.innerHTML += `
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

</div>`;
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
   INIT START
====================== */

document.addEventListener("DOMContentLoaded", () => {

    initBooks();
    renderBooks();
    listenFirebase();

    document.getElementById("cancelDeleteBtn")?.addEventListener("click", () => {
        document.getElementById("deleteModal")?.classList.remove("show");
    });

    document.getElementById("confirmDeleteBtn")?.addEventListener("click", () => {

        books = books.filter(b => b.id !== deleteBookId);

        saveLocal();
        syncFirebase();
        renderBooks();

        document.getElementById("deleteModal")?.classList.remove("show");
        deleteBookId = null;
    });

});

/* ======================
   ADD BOOK
====================== */

document.querySelector(".add-book-btn")?.addEventListener("click", () => {
    document.getElementById("addModal").classList.add("show");
});

function addBook() {
    document.getElementById("addModal").classList.add("show");
}

document.getElementById("saveAddBtn")?.addEventListener("click", () => {

    const title = document.getElementById("newBookTitle").value.trim();
    if (!title) return;

    books.push({
        id: Date.now(),
        title,
        icon: "📘",
        count: 0,
        qrs: []
    });

    saveLocal();
    syncFirebase();
    renderBooks();

    document.getElementById("addModal").classList.remove("show");
});

/* ======================
   EDIT
====================== */

let currentEditId = null;

function editBook(id) {
    currentEditId = id;

    const book = books.find(b => b.id === id);
    if (!book) return;

    document.getElementById("editBookTitle").value = book.title;
    document.getElementById("editModal").classList.add("show");
}

document.getElementById("saveEditBtn")?.addEventListener("click", () => {

    const newTitle = document.getElementById("editBookTitle").value.trim();
    if (!newTitle) return;

    const index = books.findIndex(b => b.id === currentEditId);
    if (index === -1) return;

    books[index].title = newTitle;

    saveLocal();
    syncFirebase();
    renderBooks();

    document.getElementById("editModal").classList.remove("show");
});

/* ======================
   CANCEL MODALS
====================== */

document.getElementById("cancelAddBtn")?.addEventListener("click", () => {
    document.getElementById("addModal").classList.remove("show");
});

document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
    document.getElementById("editModal").classList.remove("show");
});

/* ======================
   OPEN BOOK
====================== */

function openBook(id) {
    window.location.href = "book.html?id=" + id;
}
