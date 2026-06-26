import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

/* ======================
   LOADING STATE (Skeleton بسيط)
====================== */
const booksCount = document.getElementById("booksCount");
const qrsCount = document.getElementById("qrsCount");

/* قيم مبدئية تمنع الفلاش */
booksCount.textContent = "—";
qrsCount.textContent = "—";

async function ensureDatabase() {
    const snap = await getDoc(booksRef);

    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

function updateDashboard(books) {

    const totalBooks = books.length;

    const totalQrs = books.reduce((sum, book) => {
        return sum + ((book.qrs || []).length);
    }, 0);

    /* تحديث مباشر بدون فلاش */
    requestAnimationFrame(() => {
        booksCount.textContent = totalBooks;
        qrsCount.textContent = totalQrs;
    });
}

/* إنشاء قاعدة البيانات */
ensureDatabase();

/* ======================
   REALTIME LISTENER
====================== */
onSnapshot(booksRef, (snap) => {

    const data = snap.data();
    const books = data?.books || [];

    updateDashboard(books);
});
