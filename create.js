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
