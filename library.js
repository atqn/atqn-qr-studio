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

function getBooks() {

    const saved =
        localStorage.getItem("atqn_books");

    if (!saved) {

        localStorage.setItem(
            "atqn_books",
            JSON.stringify(defaultBooks)
        );

        return defaultBooks;
    }

    return JSON.parse(saved);
}

function saveBooks(books) {

    localStorage.setItem(
        "atqn_books",
        JSON.stringify(books)
    );
}

function renderBooks() {

    const booksGrid =
        document.getElementById("booksGrid");

    if (!booksGrid) return;

    const books =
        getBooks();

    booksGrid.innerHTML = "";

    books.forEach(book => {

        booksGrid.innerHTML += `

<div class="book-card">

    <div class="book-icon">
        ${book.icon}
    </div>

    <h3>
        ${book.title}
    </h3>

    <div class="book-count">
        ${book.count} QR
    </div>

    <div class="book-actions">

        <button
            class="action-btn edit-btn">
            ✏️ تعديل
        </button>

        <button
            class="action-btn delete-btn">
            🗑 حذف
        </button>

    </div>

    <button class="book-btn">
        📖 فتح الكتاب
    </button>

</div>

`;
    });

    console.log(
        "Books Loaded:",
        books.length
    );
}

document.addEventListener(
    "DOMContentLoaded",
    renderBooks
);
