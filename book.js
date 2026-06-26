import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

const params = new URLSearchParams(location.search);
const bookId = Number(params.get("id"));

let books = [];
let currentBook = null;

async function ensureDatabase() {
    const snap = await getDoc(booksRef);
    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

function getBook() {
    return books.find(b => b.id === bookId);
}

function render() {
    const title = document.getElementById("bookTitle");
    const count = document.getElementById("bookCount");
    const list = document.getElementById("qrList");

    if (!currentBook) return;

    title.textContent = currentBook.title;
    count.textContent = (currentBook.qrs || []).length;

    list.innerHTML = "";

    (currentBook.qrs || []).forEach(qr => {

        const card = document.createElement("div");
        card.className = "book-card";

        card.innerHTML = `
            <h3>${qr.title}</h3>
            <p>${qr.description || ""}</p>
            <button class="qr-open">فتح</button>
        `;

        card.querySelector(".qr-open").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            let url = qr.content || "";

            if (!url) return;

            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            window.open(url, "_blank", "noopener");
        });

        list.appendChild(card);
    });
}

ensureDatabase();

onSnapshot(booksRef, (snap) => {
    books = snap.data()?.books || [];
    currentBook = getBook();
    render();
});
