document.addEventListener(
    "DOMContentLoaded",
    function () {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const bookId =
            Number(
                params.get("book")
            );

        const qrId =
            Number(
                params.get("qr")
            );

        if (!bookId || !qrId)
            return;

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

        if (!book)
            return;

        document.getElementById(
            "bookNameInput"
        ).value =
            book.title;

        if (!book.qrs)
            return;

        const qr =
            book.qrs.find(
                q => q.id === qrId
            );

        if (!qr)
            return;

        document.getElementById(
            "qrTitleInput"
        ).value =
            qr.title;

        document.getElementById(
            "qrContentInput"
        ).value =
            qr.content || "";

    }
);

document.addEventListener("DOMContentLoaded", function () {

    const saveBtn =
        document.getElementById("saveQrChangesBtn");

    if (!saveBtn) return;

    saveBtn.addEventListener("click", function () {

        const params = new URLSearchParams(window.location.search);

        const bookId = Number(params.get("book"));
        const qrId = Number(params.get("qr"));

        if (!bookId || !qrId) return;

        const books =
            JSON.parse(localStorage.getItem("atqn_books")) || [];

        const bookIndex =
            books.findIndex(book => book.id === bookId);

        if (bookIndex === -1) return;

        const qrIndex =
            books[bookIndex].qrs.findIndex(qr => qr.id === qrId);

        if (qrIndex === -1) return;

        books[bookIndex].qrs[qrIndex].title =
            document.getElementById("qrTitleInput").value.trim();

        books[bookIndex].qrs[qrIndex].content =
            document.getElementById("qrContentInput").value.trim();

        localStorage.setItem(
            "atqn_books",
            JSON.stringify(books)
        );

        window.location.href =
            "book.html?id=" + bookId;
    });
});
