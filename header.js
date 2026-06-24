export function loadHeader() {

  const header = document.createElement("header");

  header.className = "topbar";

  header.innerHTML = `
    <div class="brand">
        <img src="assets/atqn-logo.png" alt="ATQN">
        <h1>ATQN QR Studio</h1>
    </div>

    <nav>
        <a href="index.html">الرئيسة</a>
        <a href="library.html">مكتبة الكتب</a>
        <a href="create.html">إنشاء QR</a>
        <a href="#" id="logoutBtn">خروج</a>
    </nav>
  `;

  document.body.prepend(header);

  document.getElementById("logoutBtn").onclick = () => {
    import("./auth.js").then(m => m.logout());
  };
}
