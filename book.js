if (!document.body) {
    throw new Error("Page not ready");
}

import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

guard();

const params = new URLSearchParams(window.location.search);
const bookId = Number(params.get("id"));

let books = [];
let currentBook = null;

let editQrId = null;
let deleteQrId = null;

const bookTitle = document.getElementById("bookTitle");
const bookCount = document.getElementById("bookCount");
const qrList = document.getElementById("qrList");

const addQrBtn = document.getElementById("addQrBtn");

const qrModal = document.getElementById("qrModal");
const qrModalTitle = document.getElementById("qrModalTitle");
const qrTitleInput = document.getElementById("qrTitleInput");
const qrDescriptionInput = document.getElementById("qrDescriptionInput");
const qrLinkInput = document.getElementById("qrLinkInput");
const saveQrBtn = document.getElementById("saveQrBtn");
const cancelQrBtn = document.getElementById("cancelQrBtn");

const deleteQrModal = document.getElementById("deleteQrModal");
const confirmDeleteQrBtn = document.getElementById("confirmDeleteQrBtn");
const cancelDeleteQrBtn = document.getElementById("cancelDeleteQrBtn");

async function ensureDatabase() {
    const snap = await getDoc(booksRef);

    if (!snap.exists()) {
        await setDoc(booksRef, { books: [] });
    }
}

function getCurrentBookIndex() {
    return books.findIndex((book) => book.id === bookId);
}

function updateHeader() {
    if (!currentBook) {
        bookTitle.textContent = "الكتاب غير موجود";
        bookCount.textContent = "عدد الأكواد: 0";
        return;
    }

    bookTitle.textContent = currentBook.title || "اسم الكتاب";
    bookCount.textContent = "عدد الأكواد: " + ((currentBook.qrs || []).length);
}

function renderQrList() {
    qrList.innerHTML = "";

    if (!currentBook) {
        qrList.innerHTML = `
            <div class="book-card">
                <div class="book-icon">⚠️</div>
                <h3>الكتاب غير موجود</h3>
                <div class="book-count">ارجع إلى المكتبة</div>
            </div>
        `;
        return;
    }

    const qrs = currentBook.qrs || [];

    if (qrs.length === 0) {
        qrList.innerHTML = `
            <div class="book-card">
                <div class="book-icon">🔗</div>
                <h3>لا توجد أكواد QR بعد</h3>
                <div class="book-count">اضغط على إضافة QR جديد</div>
            </div>
        `;
        return;
    }

    qrs.forEach((qr) => {
        qrList.innerHTML += `
            <div class="book-card">

                <div class="book-icon">🔗</div>

                <h3>${qr.title || ""}</h3>

                <div class="qr-description">
                    ${qr.description || "بدون وصف"}
                </div>

                <div class="qr-link-badge">
                    🌐 رابط مرفق
                </div>

                <div class="book-actions">
                    <button class="action-btn edit-btn" data-edit="${qr.id}">
                        ✏️ تعديل
                    </button>

                    <button class="action-btn delete-btn" data-delete="${qr.id}">
                        🗑 حذف
                    </button>
                </div>

                <button class="book-btn" data-open="${qr.id}">
                    📖 فتح
                </button>

            </div>
        `;
    });
}

function openQrModal(mode, qr = null) {
    editQrId = qr ? qr.id : null;

    qrModalTitle.textContent = mode === "edit" ? "تعديل QR" : "إضافة QR جديد";
    saveQrBtn.textContent = "حفظ";

    qrTitleInput.value = qr?.title || "";
    qrDescriptionInput.value = qr?.description || "";
    qrLinkInput.value = qr?.content || "";

    qrModal.classList.add("show");
    qrTitleInput.focus();
}

function closeQrModal() {
    editQrId = null;

    qrTitleInput.value = "";
    qrDescriptionInput.value = "";
    qrLinkInput.value = "";

    qrModal.classList.remove("show");
}

async function saveBooks() {
    await setDoc(booksRef, { books });
}

addQrBtn.addEventListener("click", () => {
    openQrModal("add");
});

cancelQrBtn.addEventListener("click", closeQrModal);

saveQrBtn.addEventListener("click", async () => {
    const title = qrTitleInput.value.trim();
    const description = qrDescriptionInput.value.trim();
    const content = qrLinkInput.value.trim();

    if (!title || !content) {
        alert("يرجى تعبئة عنوان QR والرابط");
        return;
    }

    const bookIndex = getCurrentBookIndex();
    if (bookIndex === -1) return;

    books[bookIndex].qrs = books[bookIndex].qrs || [];

    if (editQrId) {
        const qrIndex = books[bookIndex].qrs.findIndex((qr) => qr.id === editQrId);

        if (qrIndex !== -1) {
            books[bookIndex].qrs[qrIndex] = {
                ...books[bookIndex].qrs[qrIndex],
                title,
                description,
                content,
                updatedAt: Date.now()
            };
        }
    } else {
        books[bookIndex].qrs.push({
            id: Date.now(),
            title,
            description,
            content,
            qrSettings: {
                color: "#38bdf8",
                style: "square",
                size: 600,
                logoMode: "default"
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }

    books[bookIndex].count = books[bookIndex].qrs.length;

    await saveBooks();
    closeQrModal();
});

qrList.addEventListener("click", (event) => {
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;
    const openId = event.target.dataset.open;

    if (editId) {
        const qr = (currentBook.qrs || []).find((item) => item.id === Number(editId));
        if (qr) openQrModal("edit", qr);
    }

    if (deleteId) {
        deleteQrId = Number(deleteId);
        deleteQrModal.classList.add("show");
    }

    if (openId) {
        window.location.href = `create.html?book=${bookId}&qr=${openId}`;
    }
});

cancelDeleteQrBtn.addEventListener("click", () => {
    deleteQrId = null;
    deleteQrModal.classList.remove("show");
});

confirmDeleteQrBtn.addEventListener("click", async () => {
    const bookIndex = getCurrentBookIndex();

    if (bookIndex === -1 || !deleteQrId) return;

    books[bookIndex].qrs = (books[bookIndex].qrs || []).filter((qr) => {
        return qr.id !== deleteQrId;
    });

    books[bookIndex].count = books[bookIndex].qrs.length;

    await saveBooks();

    deleteQrId = null;
    deleteQrModal.classList.remove("show");
});

ensureDatabase();

onSnapshot(booksRef, (snap) => {
    const data = snap.data();

    books = data?.books || [];
    currentBook = books.find((book) => book.id === bookId) || null;

    updateHeader();
    renderQrList();
});
