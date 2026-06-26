import { guard } from "./auth.js";
import { booksRef, getDoc, setDoc, onSnapshot } from "./firebase.js";

/* ======================
   GUARD
====================== */
guard();

/* ======================
   SAFETY CHECK
====================== */
if (!document.getElementById("qrList")) {
    console.warn("Book page not loaded properly");
}

/* ======================
   STATE
====================== */
const params = new URLSearchParams(window.location.search);
const bookId = Number(params.get("id"));

let books = [];
let currentBook = null;

let editQrId = null;
let deleteQrId = null;

/* ======================
   ELEMENTS
====================== */
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

/* ======================
   SAFE OPEN (NEW)
====================== */
function safeOpen(url) {
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    window.open(url, "_blank", "noopener");
}

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
   HELPERS
====================== */
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

/* ======================
   RENDER QR LIST
====================== */
function renderQrList() {

    if (!qrList) return;

    qrList.innerHTML = "";

    if (!currentBook) return;

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

/* ======================
   MODAL
====================== */
function openQrModal(mode, qr = null) {
    editQrId = qr ? qr.id : null;

    qrModalTitle.textContent = mode === "edit" ? "تعديل QR" : "إضافة QR جديد";

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

/* ======================
   SAVE
====================== */
async function saveBooks() {
    await setDoc(booksRef, { books });
}

/* ======================
   EVENTS
====================== */
if (addQrBtn) {
    addQrBtn.addEventListener("click", () => {
        openQrModal("add");
    });
}

if (cancelQrBtn) {
    cancelQrBtn.addEventListener("click", closeQrModal);
}

if (saveQrBtn) {
    saveQrBtn.addEventListener("click", async () => {

        const title = qrTitleInput.value.trim();
        const description = qrDescriptionInput.value.trim();
        const content = qrLinkInput.value.trim();

        if (!title || !content) {
            alert("يرجى تعبئة البيانات");
            return;
        }

        const bookIndex = getCurrentBookIndex();
        if (bookIndex === -1) return;

        books[bookIndex].qrs = books[bookIndex].qrs || [];

        if (editQrId) {

            const idx = books[bookIndex].qrs.findIndex(q => q.id === editQrId);

            if (idx !== -1) {
                books[bookIndex].qrs[idx] = {
                    ...books[bookIndex].qrs[idx],
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
                createdAt: Date.now()
            });
        }

        books[bookIndex].count = books[bookIndex].qrs.length;

        await saveBooks();
        closeQrModal();
    });
}

/* ======================
   CLICK HANDLER (FIXED)
====================== */
if (qrList) {
    qrList.addEventListener("click", (event) => {

        const editId = event.target.dataset.edit;
        const deleteId = event.target.dataset.delete;
        const openId = event.target.dataset.open;

        if (editId) {
            const qr = (currentBook?.qrs || []).find(q => q.id === Number(editId));
            if (qr) openQrModal("edit", qr);
        }

        if (deleteId) {
            deleteQrId = Number(deleteId);
            deleteQrModal?.classList.add("show");
        }

        if (openId) {
            const qr = (currentBook?.qrs || []).find(q => q.id === Number(openId));
            if (qr) {
                safeOpen(qr.content);   // 🔥 التعديل الأساسي هنا
            }
        }
    });
}

/* ======================
   DELETE
====================== */
if (cancelDeleteQrBtn) {
    cancelDeleteQrBtn.addEventListener("click", () => {
        deleteQrId = null;
        deleteQrModal?.classList.remove("show");
    });
}

if (confirmDeleteQrBtn) {
    confirmDeleteQrBtn.addEventListener("click", async () => {

        const bookIndex = getCurrentBookIndex();

        if (bookIndex === -1 || !deleteQrId) return;

        books[bookIndex].qrs =
            (books[bookIndex].qrs || []).filter(q => q.id !== deleteQrId);

        books[bookIndex].count = books[bookIndex].qrs.length;

        await saveBooks();

        deleteQrId = null;
        deleteQrModal?.classList.remove("show");
    });
}

/* ======================
   FIREBASE
====================== */
ensureDatabase();

onSnapshot(booksRef, (snap) => {

    const data = snap.data();

    books = data?.books || [];

    currentBook = books.find((b) => b.id === bookId) || null;

    updateHeader();
    renderQrList();
});
