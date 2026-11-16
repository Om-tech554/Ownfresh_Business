import PDFDocument from "pdfkit";
import axios from "axios";

/**
 * Strips conflicting hardcoded volume text from product names when a variant size is present.
 */
export const cleanProductTitle = (name, variantName) => {
  if (!name) return "";
  let clean = name.replace(/\s+/g, " ").trim();
  if (variantName) {
    clean = clean
      .replace(/\b(\d+(?:\.\d+)?)\s*(ml|millilitre|milliliter|l|litre|liter|ltr|kg|gm|g)\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+-\s+$/, "")
      .trim();
  }
  return clean || name;
};

/**
 * Dynamically generates a professional A4 invoice PDF for an order.
 * Uses ASCII-safe currency format (Rs.) to prevent WinAnsi citation '1 glyph glitches in PDF engines.
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
        doc.fillColor("#166534").fontSize(18).font("Helvetica-Bold").text("OwnFresh", 30, 25);
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
      doc.rect(30, tableTop, 535, 16).fill("#F3F4F6");
      
      doc.fillColor("#374151").fontSize(7).font("Helvetica-Bold");
      doc.text("S.No.", 35, tableTop + 4);
      doc.text("Product Description", 65, tableTop + 4);
      doc.text("HSN", 255, tableTop + 4, { width: 30, align: "center" });
      doc.text("Unit Price (Rs.)", 290, tableTop + 4, { width: 60, align: "right" });
      doc.text("Qty", 355, tableTop + 4, { width: 30, align: "center" });
      doc.text("CGST (2.5%)", 395, tableTop + 4, { width: 50, align: "right" });
      doc.text("SGST (2.5%)", 455, tableTop + 4, { width: 50, align: "right" });
      doc.text("Amount (Rs.)", 515, tableTop + 4, { width: 45, align: "right" });

      doc.moveTo(30, tableTop + 16).lineTo(565, tableTop + 16).strokeColor("#E5E7EB").lineWidth(0.5).stroke();

      // 6. Table Items
      let currentY = tableTop + 16;
      (order.items || []).forEach((item, index) => {
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const lineTotal = price * qty;
        const unitBase = price / 1.05;
        const itemTaxable = lineTotal / 1.05;
        const cgst = itemTaxable * 0.025;
        const sgst = itemTaxable * 0.025;
        const total = lineTotal;

        const displayName = cleanProductTitle(item.name, item.variantName);
        
        // Measure title height to allocate perfect row space
        doc.fontSize(7.5).font("Helvetica-Bold");
        const titleHeight = doc.heightOfString(displayName, { width: 185 });
        const rowHeight = item.variantName ? Math.max(26, titleHeight + 14) : Math.max(20, titleHeight + 8);

        if (index % 2 === 1) {
          doc.rect(30, currentY, 535, rowHeight).fill("#F9FAFB");
        }

        // S.No.
        doc.fillColor("#1F2937").fontSize(7.5).font("Helvetica");
        doc.text(String(index + 1), 35, currentY + 4);
        
        // Clean Product Name
        doc.font("Helvetica-Bold").text(displayName, 65, currentY + 4, { width: 185 });
        
        // Variant below title (with safe vertical gap, no overlapping)
        if (item.variantName) {
          doc.fontSize(6.5).fillColor("#166534").font("Helvetica-Bold").text(`Size / Variant: ${item.variantName}`, 65, currentY + 4 + titleHeight + 2);
          doc.fontSize(7.5).fillColor("#1F2937");
        }

        // Numbers (clean ASCII numbers without Unicode symbol glitch)
        doc.font("Helvetica").text("1515", 255, currentY + 4, { width: 30, align: "center" });
        doc.text(unitBase.toFixed(2), 290, currentY + 4, { width: 60, align: "right" });
        doc.font("Helvetica-Bold").text(String(qty), 355, currentY + 4, { width: 30, align: "center" });
        doc.font("Helvetica").text(cgst.toFixed(2), 395, currentY + 4, { width: 50, align: "right" });
        doc.text(sgst.toFixed(2), 455, currentY + 4, { width: 50, align: "right" });
        doc.font("Helvetica-Bold").text(total.toFixed(2), 515, currentY + 4, { width: 45, align: "right" });

        currentY += rowHeight;
      });

      // Bottom boundary
      doc.moveTo(30, currentY).lineTo(565, currentY).strokeColor("#E5E7EB").stroke();

      // 7. Calculations block
      currentY += 8;
      const subtotal = (order.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxableSubtotal = Math.round((subtotal / 1.05) * 100) / 100;
      const cgstVal = order.cgst || (taxableSubtotal * 0.025);
      const sgstVal = order.sgst || (taxableSubtotal * 0.025);

      doc.fontSize(7.5).fillColor("#4B5563").font("Helvetica");

      doc.text("Taxable Value", 380, currentY, { width: 100, align: "right" });
      doc.text(`Rs. ${taxableSubtotal.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
      currentY += 12;

      doc.text("CGST (2.5%)", 380, currentY, { width: 100, align: "right" });
      doc.text(`Rs. ${cgstVal.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
      currentY += 12;

      doc.text("SGST (2.5%)", 380, currentY, { width: 100, align: "right" });
      doc.text(`Rs. ${sgstVal.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
      currentY += 12;

      const deliveryChargeVal = order.deliveryCharge || 0;
      doc.fillColor(deliveryChargeVal === 0 ? "#059669" : "#4B5563");
      doc.text("Delivery Charges", 380, currentY, { width: 100, align: "right" });
      doc.text(deliveryChargeVal === 0 ? "FREE" : `Rs. ${deliveryChargeVal.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
      currentY += 12;
      doc.fillColor("#4B5563");

      if (order.discountAmount > 0) {
        doc.fillColor("#DC2626").text(order.couponCode ? `Coupon (${order.couponCode})` : "Discount Applied", 380, currentY, { width: 100, align: "right" });
        doc.text(`- Rs. ${order.discountAmount.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
        currentY += 12;
      }

      if (order.walletDeductedAmount > 0) {
        doc.fillColor("#059669").text("Wallet Balance Used", 380, currentY, { width: 100, align: "right" });
        doc.text(`- Rs. ${order.walletDeductedAmount.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });
        currentY += 12;
      }

      doc.moveTo(380, currentY).lineTo(565, currentY).strokeColor("#E5E7EB").stroke();
      currentY += 4;

      doc.fillColor("#111827").fontSize(8.5).font("Helvetica-Bold");
      doc.text("Grand Total", 380, currentY, { width: 100, align: "right" });
      doc.text(`Rs. ${order.totalAmount.toFixed(2)}`, 490, currentY, { width: 70, align: "right" });

      // 8. Digitally Verified Badge
      currentY += 20;
      doc.rect(420, currentY, 145, 28).lineWidth(0.5).strokeColor("#A7F3D0").fill("#ECFDF5");
      
      // Draw green check circles
      doc.fillColor("#10B981").circle(435, currentY + 14, 6).fill();
      doc.fillColor("#FFFFFF").fontSize(6.5).font("Helvetica-Bold").text("OK", 430.5, currentY + 10.5);

      doc.fillColor("#111827").fontSize(7.5).font("Helvetica-Bold").text("Digitally Verified", 448, currentY + 5);
      doc.fillColor("#4B5563").fontSize(6).font("Helvetica").text("OwnFresh Agro Industries", 448, currentY + 15);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
