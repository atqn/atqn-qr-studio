function getLocalBooks() {
    return JSON.parse(localStorage.getItem("atqn_books") || "[]");
}

function saveLocalBooks(books) {
    localStorage.setItem("atqn_books", JSON.stringify(books));
}

// حفظ + رفع إلى Firebase
function syncToFirebase(db, books) {
    if (!db) return;

    const ref = firebase.firestore().doc(db, "books/global");

    ref.set({
        books: books,
        updatedAt: Date.now()
    });
}

// جلب من Firebase
function listenFirebase(db, callback) {
    const ref = firebase.firestore().doc(db, "books/global");

    ref.onSnapshot((snap) => {
        if (!snap.exists) return;

        const data = snap.data();
        if (data?.books) {
            callback(data.books);
        }
    });
}
