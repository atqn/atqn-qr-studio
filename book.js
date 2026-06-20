const params =
    new URLSearchParams(
        window.location.search
    );

const bookId =
    Number(
        params.get("id")
    );

const books =
    JSON.parse(
        localStorage.getItem(
            "atqn_books"
        )
    ) || [];

const book =
    books.find(
        b => b.id === bookId
    );

if (book) {

    document.getElementById(
        "bookTitle"
    ).textContent =
        book.title;

    document.getElementById(
        "bookCount"
    ).textContent =
        "عدد الأكواد: " +
        book.count;
}
