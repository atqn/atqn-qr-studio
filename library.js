import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

const CACHE_KEY = "atqn_library_cache";

let books = [];
let editBookId = null;
let deleteBookId = null;

const booksGrid = document.getElementById("booksGrid");

/* ======================
   INSTANT CACHE LOAD
====================== */
function loadCache() {

    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
        try {
            books = JSON.parse(cached);
            renderBooks();
        } catch (e) {}
    }
}

function saveCache() {
    localStorage.setItem(CACHE_KEY, JSON.stringify(books));
}

/* ======================
   SKELETON (fast UI)
====================== */
booksGrid.innerHTML = `
    <div class="book-card">
        <div class="book-icon">⏳</div>
        <h3>جاري التحميل...</h3>
        <div class="book-count">...</div>
    </div>
`;

loadCache();

/* ======================
   DB INIT
====================== */
async function ensureDatabase() {
    const snap = await getDoc(booksRef);

    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

function saveBooks() {
    saveCache();
    return setDoc(booksRef, { books });
}

/* ======================
   RENDER (optimized)
====================== */
function renderBooks() {

    if (!books) return;

    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div class="book-card">
                <div class="book-icon">📚</div>
                <h3>لا توجد كتب بعد</h3>
            </div>
        `;
        return;
    }

    let html = "";

    for (const book of books) {

        const count = (book.qrs || []).length;

        html += `
            <div class="book-card">

                <div class="book-icon">${book.icon || "📘"}</div>

                <h3>${book.title || ""}</h3>

                <div class="book-count">${count} QR</div>

                <button class="book-btn" data-open="${book.id}">
                    📖 فتح
                </button>

            </div>
        `;
    }

    requestAnimationFrame(() => {
        booksGrid.innerHTML = html;
    });
}

/* ======================
   MODAL + ACTIONS (unchanged)
====================== */
function openBookModal(mode, book = null) {
    editBookId = book ? book.id : null;

    document.getElementById("bookModal").classList.add("show");
    document.getElementById("bookTitleInput").value = book?.title || "";
}

function closeBookModal() {
    editBookId = null;
    document.getElementById("bookModal").classList.remove("show");
}

/* EVENTS */
document.getElementById("addBookBtn").addEventListener("click", () => {
    openBookModal("add");
});

document.getElementById("saveBookBtn").addEventListener("click", async () => {

    const title = document.getElementById("bookTitleInput").value.trim();
    if (!title) return;

    if (editBookId) {

        const index = books.findIndex(b => b.id === editBookId);
        if (index !== -1) books[index].title = title;

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

document.getElementById("cancelBookBtn").addEventListener("click", closeBookModal);

/* CLICK */
booksGrid.addEventListener("click", (event) => {

    const openId = event.target.dataset.open;

    if (openId) {
        window.location.href = `book.html?id=${openId}`;
    }
});

ensureDatabase();

/* ======================
   FIREBASE REALTIME
====================== */
onSnapshot(booksRef, (snap) => {

    const data = snap.data();
    books = data?.books || [];

    renderBooks();
    saveCache();
});
