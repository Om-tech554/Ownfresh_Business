import PDFDocument from "pdfkit";
import axios from "axios";

/**
 * Dynamically generates a professional A4 invoice PDF for an order.
 * @param {Object} order - The populated order object.
 * @returns {Promise<Buffer>} - Resolves to the PDF buffer.
 */
export const generateInvoicePdf = async (order) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // 1. Fetch Logo
      let logoBuffer = null;
      try {
        const logoUrl = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png";
        const response = await axios.get(logoUrl, { responseType: "arraybuffer" });
        logoBuffer = Buffer.from(response.data);
      } catch (err) {
        console.error("Failed to fetch logo for PDF invoice generation:", err.message);
      }

      // 2. Header
      if (logoBuffer) {
        doc.image(logoBuffer, 30, 25, { height: 35 });
      } else {
        doc.fillColor("#24672E").fontSize(18).font("Helvetica-Bold").text("OwnFresh", 30, 25);
      }

      doc.fillColor("#6B7280").fontSize(8).font("Helvetica").text("Stone-Pressed Botanic Purity", 30, 65);

      doc.fillColor("#111827").fontSize(12).font("Helvetica-Bold").text("Tax Invoice / Bill of Supply", 350, 25, { align: "right" });
      doc.fontSize(8).fillColor("#6B7280").font("Helvetica").text("GSTIN: 27BTGPS0169E1ZL", 350, 42, { align: "right" });

      // Horizontal separator
      doc.moveTo(30, 80).lineTo(565, 80).strokeColor("#E5E7EB").lineWidth(1).stroke();

      // 3. Invoice Meta Grid
      doc.fontSize(7).fillColor("#9CA3AF").font("Helvetica-Bold").text("INVOICE / ORDER ID", 30, 90);
      doc.fontSize(8).fillColor("#1F2937").font("Helvetica-Bold").text(`#${order.customOrderId || order._id.toString().toUpperCase()}`, 30, 100);

      doc.fontSize(7).fillColor("#9CA3AF").font("Helvetica-Bold").text("INVOICE DATE", 165, 90);
      const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      doc.fontSize(8).fillColor("#1F2937").font("Helvetica").text(invoiceDate, 165, 100);

      doc.fontSize(7).fillColor("#9CA3AF").font("Helvetica-Bold").text("PAYMENT MODE", 300, 90);
      doc.fontSize(8).fillColor("#1F2937").font("Helvetica").text((order.PaymentMethod || "Online").toUpperCase(), 300, 100);

      doc.fontSize(7).fillColor("#9CA3AF").font("Helvetica-Bold").text("SHIPPING STATUS", 435, 90);
      doc.fontSize(8).fillColor("#059669").font("Helvetica-Bold").text("PAID & CONFIRMED", 435, 100);

      // Horizontal separator
      doc.moveTo(30, 118).lineTo(565, 118).strokeColor("#E5E7EB").stroke();

      // 4. Addresses Section
      // Seller
      doc.fontSize(7).fillColor("#9CA3AF").font("Helvetica-Bold").text("SOLD BY (SELLER)", 30, 128);
      doc.fontSize(8).fillColor("#1F2937").font("Helvetica-Bold").text("OwnFresh Agro Industries", 30, 138);
      doc.fontSize(7.5).fillColor("#4B5563").font("Helvetica").text("Pune, Maharashtra, India\nEmail: contact@myownfresh.com\nGSTIN: 27BTGPS0169E1ZL", 30, 150, { lineGap: 3 });

      // Customer
      doc.fontSize(7).fillColor("#9CA3AF").font("Helvetica-Bold").text("BILLING & SHIPPING ADDRESS", 300, 128);
      doc.fontSize(8).fillColor("#1F2937").font("Helvetica-Bold").text(order.user?.fullName || order.deliveryAddress?.name || "Customer", 300, 138);
      
      const phoneVal = order.deliveryAddress?.phone || order.user?.mobile || "";
      const addressText = [
        order.deliveryAddress?.roomNumber,
        order.deliveryAddress?.areaName,
        order.deliveryAddress?.text,
        order.deliveryAddress?.pinCode
      ].filter(Boolean).join(", ");

      doc.fontSize(7.5).fillColor("#4B5563").font("Helvetica").text(`${phoneVal ? `Phone: ${phoneVal}\n` : ""}Address: ${addressText}`, 300, 150, { lineGap: 3, width: 265 });

      // Horizontal separator
      doc.moveTo(30, 195).lineTo(565, 195).strokeColor("#E5E7EB").stroke();

      // 5. Table Header
      const tableTop = 205;
      doc.rect(30, tableTop, 535, 15).fill("#F9FAFB");
      
      doc.fillColor("#4B5563").fontSize(7).font("Helvetica-Bold");
      doc.text("S.No.", 35, tableTop + 4);
      doc.text("Product Name", 65, tableTop + 4);
      doc.text("HSN", 260, tableTop + 4, { width: 30, align: "center" });
      doc.text("Unit Price", 300, tableTop + 4, { width: 50, align: "right" });
      doc.text("Qty", 360, tableTop + 4, { width: 30, align: "center" });
      doc.text("CGST (2.5%)", 400, tableTop + 4, { width: 50, align: "right" });
      doc.text("SGST (2.5%)", 460, tableTop + 4, { width: 50, align: "right" });
      doc.text("Amount (₹)", 520, tableTop + 4, { width: 40, align: "right" });

      doc.moveTo(30, tableTop + 15).lineTo(565, tableTop + 15).strokeColor("#E5E7EB").lineWidth(0.5).stroke();

      // 6. Table Items
      let currentY = tableTop + 15;
      (order.items || []).forEach((item, index) => {
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const lineTotal = price * qty;
        const cgst = lineTotal * 0.025;
        const sgst = lineTotal * 0.025;
        const total = lineTotal + cgst + sgst;

        if (index % 2 === 1) {
          doc.rect(30, currentY, 535, 18).fill("#F9FAFB");
        }

        doc.fillColor("#1F2937").fontSize(7.5).font("Helvetica");
        doc.text(String(index + 1), 35, currentY + 5);
        
        doc.font("Helvetica-Bold").text(item.name, 65, currentY + 5, { width: 190 });
        if (item.variantName) {
          doc.fontSize(6.5).fillColor("#9CA3AF").font("Helvetica").text(`Variant: ${item.variantName}`, 65, currentY + 12);
          doc.fontSize(7.5).fillColor("#1F2937");
        }

        doc.font("Helvetica").text("1515", 260, currentY + 5, { width: 30, align: "center" });
        doc.text(`₹${price.toFixed(2)}`, 300, currentY + 5, { width: 50, align: "right" });
        doc.font("Helvetica-Bold").text(String(qty), 360, currentY + 5, { width: 30, align: "center" });
        doc.font("Helvetica").text(`₹${cgst.toFixed(2)}`, 400, currentY + 5, { width: 50, align: "right" });
        doc.text(`₹${sgst.toFixed(2)}`, 460, currentY + 5, { width: 50, align: "right" });
        doc.font("Helvetica-Bold").text(`₹${total.toFixed(2)}`, 520, currentY + 5, { width: 40, align: "right" });

        currentY += item.variantName ? 20 : 16;
      });

      // Bottom boundary
      doc.moveTo(30, currentY).lineTo(565, currentY).strokeColor("#E5E7EB").stroke();

      // 7. Calculations block
      currentY += 8;
      const subtotal = (order.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const cgstVal = order.cgst || (subtotal * 0.025);
      const sgstVal = order.sgst || (subtotal * 0.025);

      doc.fontSize(7.5).fillColor("#4B5563").font("Helvetica");

      doc.text("Subtotal (Excl. Tax)", 380, currentY, { width: 100, align: "right" });
      doc.text(`₹${subtotal.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
      currentY += 12;

      doc.text("CGST (2.5%)", 380, currentY, { width: 100, align: "right" });
      doc.text(`₹${cgstVal.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
      currentY += 12;

      doc.text("SGST (2.5%)", 380, currentY, { width: 100, align: "right" });
      doc.text(`₹${sgstVal.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
      currentY += 12;

      if (order.discountAmount > 0) {
        doc.fillColor("#DC2626").text("Discount Applied", 380, currentY, { width: 100, align: "right" });
        doc.text(`-₹${order.discountAmount.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
        currentY += 12;
      }

      if (order.walletDeductedAmount > 0) {
        doc.fillColor("#059669").text("Wallet Balance Used", 380, currentY, { width: 100, align: "right" });
        doc.text(`-₹${order.walletDeductedAmount.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
        currentY += 12;
      }

      doc.moveTo(380, currentY).lineTo(565, currentY).strokeColor("#E5E7EB").stroke();
      currentY += 4;

      doc.fillColor("#111827").fontSize(8.5).font("Helvetica-Bold");
      doc.text("Grand Total", 380, currentY, { width: 100, align: "right" });
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });

      // 8. Digitally Verified Badge
      currentY += 20;
      doc.rect(420, currentY, 145, 28).lineWidth(0.5).strokeColor("#A7F3D0").fill("#ECFDF5");
      
      // Draw green check circles
      doc.fillColor("#10B981").circle(435, currentY + 14, 6).fill();
      doc.fillColor("#FFFFFF").fontSize(6.5).font("Helvetica-Bold").text("✓", 432.5, currentY + 9.5);

      doc.fillColor("#111827").fontSize(7.5).font("Helvetica-Bold").text("Digitally Verified", 448, currentY + 5);
      doc.fillColor("#4B5563").fontSize(6).font("Helvetica").text("OwnFresh Agro Industries", 448, currentY + 15);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
