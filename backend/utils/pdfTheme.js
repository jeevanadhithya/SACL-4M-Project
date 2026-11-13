const path = require("path");
const fs = require("fs");

/**
 * Enterprise PDF Helpers and Styling for Sakthi Auto Component Limited
 */

// Resolves corporate Sakthi Auto logo from backend/assets
function getLogoPath() {
  const candidates = [
    path.join(__dirname, "../assets/SakthiLogo.png"),
    path.join(__dirname, "../assets/logo.png"),
    path.join(__dirname, "../assets/logo.jpg"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Draws a professional automotive checkbox with an optional vivid green tick
 * @param {PDFDocument} doc - PDFKit instance
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {boolean} isChecked - Whether the box is checked
 * @param {number} size - Box size (default 10)
 */
function drawCheckbox(doc, x, y, isChecked = false, size = 10) {
  doc.save();
  // Draw outer box
  doc.lineWidth(0.8)
     .strokeColor(isChecked ? "#16a34a" : "#374151")
     .rect(x, y, size, size)
     .stroke();

  // If checked, draw a crisp green checkmark (✓)
  if (isChecked) {
    doc.lineWidth(1.6)
       .strokeColor("#16a34a")
       .lineCap("round")
       .lineJoin("round");

    // Path for checkmark: start at top-left-mid, go to bottom-mid, go up to top-right
    doc.moveTo(x + size * 0.2, y + size * 0.52)
       .lineTo(x + size * 0.44, y + size * 0.8)
       .lineTo(x + size * 0.82, y + size * 0.22)
       .stroke();
  }
  doc.restore();
}

/**
 * Draws standard header box for Sakthi forms
 */
function drawFormHeader(doc, { startX, currentY, pageWidth, title, qfNo, revDate, docNo }) {
  const headerHeight = 56;
  doc.lineWidth(1.2).strokeColor("#000000").rect(startX, currentY, pageWidth, headerHeight).stroke();

  // Left 35%: Logo & Company Name
  const leftWidth = 190;
  doc.lineWidth(0.8).strokeColor("#000000").rect(startX, currentY, leftWidth, headerHeight).stroke();

  const logoFile = getLogoPath();
  if (logoFile) {
    try {
      doc.image(logoFile, startX + 6, currentY + 7, { width: 44, height: 42, fit: [44, 42] });
    } catch (e) {}
  }

  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8.5);
  doc.text("SAKTHI AUTO COMPONENT", startX + 54, currentY + 16, { width: 130, align: "left" });
  doc.text("LIMITED", startX + 54, currentY + 28, { width: 130, align: "left" });

  // Center: Centered Title in Middle
  const rightWidth = 120;
  const centerWidth = pageWidth - leftWidth - rightWidth;
  const centerX = startX + leftWidth;
  doc.lineWidth(0.8).strokeColor("#000000").rect(centerX, currentY, centerWidth, headerHeight).stroke();

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827");
  doc.text(title, centerX + 5, currentY + 21, { width: centerWidth - 10, align: "center" });

  // Right: Document / QF Info
  const rightX = startX + leftWidth + centerWidth;
  doc.lineWidth(0.8).strokeColor("#000000").rect(rightX, currentY, rightWidth, headerHeight).stroke();

  doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#374151");
  if (qfNo) doc.text(qfNo, rightX + 6, currentY + 12, { width: rightWidth - 12, align: "left" });
  if (docNo) doc.font("Helvetica").fontSize(7).text(`No: ${docNo}`, rightX + 6, currentY + 26);
  if (revDate) doc.font("Helvetica").fontSize(6.5).text(revDate, rightX + 6, currentY + 40);

  return headerHeight;
}

/**
 * Draws a uniform physical signing box with ample space for pen ink signature
 */
function drawSignatureBox(doc, { x, y, width, height = 48, title, role, sign, date }) {
  doc.save();
  doc.lineWidth(0.8).strokeColor("#000000").rect(x, y, width, height).stroke();
  
  if (title) {
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#000000").text(title, x + 4, y + 4, { width: width - 8, align: "center" });
  }
  if (role) {
    doc.font("Helvetica").fontSize(6.5).fillColor("#6B7280").text(role, x + 4, y + 14, { width: width - 8, align: "center" });
  }

  // Underline for physical pen signing
  const lineY = y + height - 16;
  doc.lineWidth(0.6).strokeColor("#9CA3AF").moveTo(x + 6, lineY).lineTo(x + width - 6, lineY).stroke();
  
  doc.font("Helvetica").fontSize(6.5).fillColor("#374151");
  if (sign) {
    doc.text(sign, x + 6, lineY - 9, { width: width - 12, align: "center" });
  } else {
    doc.text("Sign : ___________________", x + 6, lineY - 8);
  }
  
  if (date) {
    doc.text(`Date: ${date}`, x + 6, lineY + 2);
  } else {
    doc.text("Date : ___________", x + 6, lineY + 2);
  }
  doc.restore();
}

module.exports = {
  getLogoPath,
  drawCheckbox,
  drawFormHeader,
  drawSignatureBox,
};

