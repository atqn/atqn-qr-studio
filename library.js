import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

let books = [];

const booksGrid = document.getElementById("booksGrid");
const addBookBtn = document.getElementById("addBookBtn");

/* ======================
   INIT DB
====================== */
async function ensureDatabase() {
    const snap = await getDoc(booksRef);
    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

/* ======================
   RENDER
====================== */
function render() {

    booksGrid.innerHTML = "";

    books.forEach(book => {

        const card = document.createElement("div");
        card.className = "book-card";

        card.innerHTML = `
            <h3>${book.title}</h3>
            <div>${(book.qrs || []).length} QR</div>

            <button class="open-book">فتح الكتاب</button>
        `;

        // FIX: منع أي تضارب click
        card.querySelector(".open-book").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `book.html?id=${book.id}`;
        });

        booksGrid.appendChild(card);
    });
}

/* ======================
   ADD BOOK BUTTON FIX
====================== */
addBookBtn?.addEventListener("click", () => {
    document.getElementById("bookModal")?.classList.add("show");
});

/* ======================
   SAVE + SYNC
====================== */
async function save() {
    await setDoc(booksRef, { books });
}

/* ======================
   FIREBASE
====================== */
ensureDatabase();

onSnapshot(booksRef, (snap) => {
    books = snap.data()?.books || [];
    render();
});
