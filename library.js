let deleteBookId = null;

function getRef() {
    if (!window.db || !window.firebaseFirestore) return null;
    return window.firebaseFirestore.doc(window.db, "books", "global");
}

const defaultBooks = [
    { id: 1, title: "كتاب المدود", icon: "📘", count: 24, qrs: [] },
    { id: 2, title: "كتاب الهمزات", icon: "📗", count: 18, qrs: [] },
    { id: 3, title: "كتاب التنوين", icon: "📙", count: 35, qrs: [] },
    { id: 4, title: "كتاب الشدة", icon: "📕", count: 12, qrs: [] }
];

let books = [];

/* ======================
   BOOTSTRAP SAFE LOAD
====================== */

function init() {
    const local = localStorage.getItem("atqn_books");
    books = local ? JSON.parse(local) : defaultBooks;
}

/* ======================
   SAVE CACHE ONLY
====================== */

function saveCache() {
    localStorage.setItem("atqn_books", JSON.stringify(books));
}

/* ======================
   FIREBASE WRITE (LOCKED)
   ❗ CRITICAL: always merge with remote first
====================== */

function pushToFirebase() {
    const ref = getRef();
    if (!ref) return;

    const fs = window.firebaseFirestore;

    // 1) read latest snapshot first
    fs.getDoc(ref).then(snap => {

        let remote = snap.exists() ? snap.data().books || [] : [];

        // 2) merge local + remote safely
        const map = new Map();

        remote.forEach(b => map.set(b.id, b));
        books.forEach(b => map.set(b.id, b));

        const merged = Array.from(map.values());

        // 3) write ONLY merged result
        fs.setDoc(ref, {
            books: merged,
            updatedAt: Date.now()
        });

        books = merged;
        saveCache();
        render();
    });
}

/* ======================
   REALTIME LISTENER (SAFE READ ONLY)
====================== */

function listen() {
    const ref = getRef();
    if (!ref) return;

    const fs = window.firebaseFirestore;

    fs.onSnapshot(ref, snap => {
        if (!snap.exists()) return;

        const data = snap.data();
        if (!Array.isArray(data.books)) return;

        books = data.books;

        saveCache();
        render();
    });
}

/* ======================
   RENDER
====================== */

function render() {
    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    grid.innerHTML = "";

    books.forEach(b => {
        grid.innerHTML += `
<div class="book-card">
    <div class="book-icon">${b.icon}</div>
    <h3>${b.title}</h3>
    <div class="book-count">${b.count} QR</div>

    <div class="book-actions">
        <button onclick="editBook(${b.id})">✏️ تعديل</button>
        <button onclick="deleteBook(${b.id})">🗑 حذف</button>
    </div>

    <button onclick="openBook(${b.id})">📖 فتح الكتاب</button>
</div>`;
    });
}

/* ======================
   DELETE SAFE
====================== */

function deleteBook(id) {
    deleteBookId = id;
    document.getElementById("deleteModal")?.classList.add("show");
}

/* ======================
   INIT
====================== */

document.addEventListener("DOMContentLoaded", () => {

    init();
    render();
    listen();

    document.getElementById("confirmDeleteBtn")?.addEventListener("click", () => {

        books = books.filter(b => b.id !== deleteBookId);

        saveCache();
        pushToFirebase();   // 🔥 SAFE WRITE
        render();

        deleteBookId = null;
        document.getElementById("deleteModal")?.classList.remove("show");
    });

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

        saveCache();
        pushToFirebase();   // 🔥 SAFE WRITE
        render();

        document.getElementById("addModal").classList.remove("show");
    });

});

function editBook(id) {

    const b = books.find(x => x.id === id);
    if (!b) return;

    document.getElementById("editBookTitle").value = b.title;
    document.getElementById("editModal").classList.add("show");

    window._editId = id;
}

document.getElementById("saveEditBtn")?.addEventListener("click", () => {

    const title = document.getElementById("editBookTitle").value.trim();
    if (!title) return;

    const i = books.findIndex(b => b.id === window._editId);
    if (i === -1) return;

    books[i].title = title;

    saveCache();
    pushToFirebase();   // 🔥 SAFE WRITE
    render();

    document.getElementById("editModal").classList.remove("show");
});

function openBook(id) {
    window.location.href = "book.html?id=" + id;
}
