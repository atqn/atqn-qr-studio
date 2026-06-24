if (!window.firebaseFirestore) {
    console.error("Firebase not loaded yet");
}

let deleteBookId = null;
let books = [];

/* ======================
   DEFAULT BOOKS
====================== */
const defaultBooks = [
    { id:1, title:"كتاب المدود", icon:"📘", count:24, qrs:[] },
    { id:2, title:"كتاب الهمزات", icon:"📗", count:18, qrs:[] },
    { id:3, title:"كتاب التنوين", icon:"📙", count:35, qrs:[] },
    { id:4, title:"كتاب الشدة", icon:"📕", count:12, qrs:[] },
    { id:5, title:"كتاب السكون", icon:"📔", count:16, qrs:[] },
    { id:6, title:"كتاب التفخيم", icon:"📓", count:21, qrs:[] },
    { id:7, title:"كتاب الترقيق", icon:"📚", count:19, qrs:[] },
    { id:8, title:"كتاب المخارج", icon:"📒", count:27, qrs:[] },
    { id:9, title:"كتاب الصفات", icon:"📖", count:14, qrs:[] },
    { id:10, title:"كتاب الوقف والابتداء", icon:"📑", count:31, qrs:[] }
];

/* ======================
   WAIT FOR FIREBASE (IMPORTANT FIX)
====================== */
function waitForFirebase(callback) {

    const check = () => {

        if (window.db && window.firebaseFirestore) {
            callback();
        } else {
            setTimeout(check, 100);
        }
    };

    check();
}

/* ======================
   MAIN INIT
====================== */
waitForFirebase(function () {

    const db = window.db;
    const fs = window.firebaseFirestore;
    const { doc, setDoc, onSnapshot } = fs;

    const booksRef = doc(db, "books", "global");

    /* ======================
       LOAD DATA (REALTIME SAFE)
    ====================== */
    onSnapshot(booksRef, async (snap) => {

        if (!snap.exists() || !snap.data()?.books) {

            await setDoc(booksRef, { books: defaultBooks });

            books = defaultBooks;

        } else {
            books = snap.data().books || [];
        }

        renderBooks();
    });

    /* ======================
       INITIAL RENDER (fallback)
    ====================== */
    renderBooks();

    /* ======================
       ADD BUTTON FIX (CRITICAL)
    ====================== */
    function bindAddButton() {

        const btn = document.querySelector(".add-book-btn");

        if (!btn) {
            setTimeout(bindAddButton, 200);
            return;
        }

        btn.addEventListener("click", function () {

            const input = document.getElementById("newBookTitle");
            if (input) input.value = "";

            const modal = document.getElementById("addModal");
            if (modal) modal.classList.add("show");
        });
    }

    bindAddButton();

    /* ======================
       DELETE MODAL
    ====================== */
    const cancelBtn = document.getElementById("cancelDeleteBtn");
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const modal = document.getElementById("deleteModal");

    cancelBtn?.addEventListener("click", () => {
        modal?.classList.remove("show");
        deleteBookId = null;
    });

    confirmBtn?.addEventListener("click", async () => {

        books = books.filter(b => b.id !== deleteBookId);

        await setDoc(booksRef, { books });

        modal?.classList.remove("show");
        deleteBookId = null;
    });

    /* ======================
       ADD BOOK
    ====================== */
    document.getElementById("saveAddBtn")?.addEventListener("click", async () => {

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

    window.editBook = function (id) {

        const book = books.find(b => b.id === id);
        if (!book) return;

        currentEditId = id;

        document.getElementById("editBookTitle").value = book.title;
        document.getElementById("editModal").classList.add("show");
    };

    document.getElementById("saveEditBtn")?.addEventListener("click", async () => {

        const newTitle = document.getElementById("editBookTitle")?.value.trim();
        if (!newTitle) return;

        const index = books.findIndex(b => b.id === currentEditId);
        if (index === -1) return;

        books[index].title = newTitle;

        await setDoc(booksRef, { books });

        document.getElementById("editModal")?.classList.remove("show");
    });

    document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
        document.getElementById("editModal")?.classList.remove("show");
    });

});

/* ======================
   RENDER (OUTSIDE SAFE)
====================== */
function renderBooks() {

    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    grid.innerHTML = "";

    if (!books.length) {
        grid.innerHTML = `
            <div class="book-card">
                <h3>لا توجد كتب</h3>
                <div class="book-count">اضغط إضافة كتاب جديد</div>
            </div>
        `;
        return;
    }

    books.forEach(book => {

        grid.innerHTML += `
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
   GLOBAL FUNCTIONS
====================== */
window.deleteBook = function (id) {
    deleteBookId = id;
    document.getElementById("deleteModal")?.classList.add("show");
};

window.openBook = function (id) {
    window.location.href = "book.html?id=" + id;
};
