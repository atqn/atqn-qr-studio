/* ======================
   QR ENGINE (CANVAS + SVG PROFESSIONAL)
====================== */

let lastQRText = "";
let qrCanvas = document.getElementById("qrCanvas");
let ctx = qrCanvas.getContext("2d");

let logoImage = null;

/* ======================
   LOAD LOGO (OPTIONAL)
====================== */
const logoInput = document.getElementById("qrLogo");

if (logoInput) {
  logoInput.addEventListener("change", (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      logoImage = new Image();
      logoImage.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

/* ======================
   GENERATE QR (CANVAS FIXED)
====================== */
document.getElementById("generateQR").addEventListener("click", async () => {

  const link = document.getElementById("qrLink").value;

  if (!link) return;

  lastQRText = link.startsWith("http") ? link : "https://" + link;

  const size = Number(document.getElementById("qrSize").value);

  qrCanvas.width = size;
  qrCanvas.height = size;

  await QRCode.toCanvas(qrCanvas, lastQRText, {
    width: size,
    color: {
      dark: document.getElementById("qrColor").value,
      light: "#ffffff"
    },
    errorCorrectionLevel: "H"
  });

  /* ======================
     ADD LOGO (CENTER)
  ====================== */
  if (logoImage) {

    const logoSize = size * 0.22;

    ctx.drawImage(
      logoImage,
      (size - logoSize) / 2,
      (size - logoSize) / 2,
      logoSize,
      logoSize
    );
  }
});
