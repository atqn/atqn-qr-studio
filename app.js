import { db, doc, setDoc, getDoc, onSnapshot } from "./firebase.js";

/* ======================
   ROOT DATABASE
====================== */
const BOOKS_REF = doc(db, "books", "global");

/* ======================
   DEFAULT DATA (FIRST RUN ONLY)
====================== */
const DEFAULT_DATA = {
  books: [
    {
      id: 1,
      title: "كتاب المدود",
      icon: "📘",
      count: 0,
      qrs: []
    },
    {
      id: 2,
      title: "كتاب الهمزات",
      icon: "📗",
      count: 0,
      qrs: []
    }
  ]
};

/* ======================
   INIT SYSTEM
====================== */
export async function initApp(onUpdate) {

  const snap = await getDoc(BOOKS_REF);

  if (!snap.exists()) {
    await setDoc(BOOKS_REF, DEFAULT_DATA);
  }

  /* ======================
     REALTIME SYNC
  ====================== */
  onSnapshot(BOOKS_REF, (snap) => {

    const data = snap.data();

    if (!data?.books) return;

    onUpdate(data.books);
  });
}

/* ======================
   SAVE BOOKS
====================== */
export async function saveBooks(books) {
  await setDoc(BOOKS_REF, { books });
}

/* ======================
   HELPERS
====================== */
export function findBook(books, id) {
  return books.find(b => b.id === Number(id));
}

export function addBook(books, title) {

  books.push({
    id: Date.now(),
    title,
    icon: "📘",
    count: 0,
    qrs: []
  });

  return books;
}

export function deleteBook(books, id) {
  return books.filter(b => b.id !== id);
}

export function updateBookTitle(books, id, title) {

  const book = books.find(b => b.id === id);
  if (book) book.title = title;

  return books;
}
