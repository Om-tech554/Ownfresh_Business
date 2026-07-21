import { createWorker } from "tesseract.js";
import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Perform OCR on images using Tesseract.js
 */
export const runImageOcr = async (imageUrl) => {
  console.log(`[OCR SERVICE] Running image OCR for URL: ${imageUrl}`);
  const worker = await createWorker("eng");
  try {
    const { data: { text } } = await worker.recognize(imageUrl);
    return text;
  } catch (error) {
    console.error("[OCR SERVICE] Image OCR error:", error.message);
    throw new Error("Failed to process image OCR: " + error.message);
  } finally {
    await worker.terminate();
  }
};

/**
 * Extract text from PDF files using pdf-parse
 */
export const runPdfTextExtraction = async (pdfUrl) => {
  console.log(`[OCR SERVICE] Running PDF text extraction for URL: ${pdfUrl}`);
  try {
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("[OCR SERVICE] PDF text extraction error:", error.message);
    throw new Error("Failed to process PDF: " + error.message);
  }
};

/**
 * Extract Courier Partner and Tracking Number from raw text
 */
export const extractCourierDetails = (text, carriers) => {
  const normalizedText = text.toLowerCase();
  
  // 1. Detect courier partner based on name keywords
  let detectedCarrier = null;
  for (const carrier of carriers) {
    const carrierName = carrier.name.toLowerCase();
    // Support matching both with and without space (e.g. "blue dart" and "bluedart")
    const simplifiedCarrierName = carrierName.replace(/\s+/g, "");
    if (normalizedText.includes(carrierName) || normalizedText.includes(simplifiedCarrierName)) {
      detectedCarrier = carrier;
      break;
    }
  }

  // Fallbacks for extra keywords
  if (!detectedCarrier) {
    if (normalizedText.includes("speed post") || normalizedText.includes("speedpost")) {
      detectedCarrier = carriers.find(c => c.name.toLowerCase() === "india post");
    } else if (normalizedText.includes("tpc")) {
      detectedCarrier = carriers.find(c => c.name.toLowerCase() === "professional couriers");
    }
  }

  // 2. Extrapolate Tracking AWB / LR Number
  // Look for common labels (AWB, Tracking No, Consignment No, LR No, Docket No, etc.)
  const labelsRegex = /(?:awb|tracking|consignment|lr\s*no|lr\s*number|docket|doc\s*no|receipt\s*no)\s*(?:#|:|no)?\s*([a-z0-9\-_]{8,22})/i;
  const labelMatch = text.match(labelsRegex);

  let trackingId = "";
  if (labelMatch && labelMatch[1]) {
    trackingId = labelMatch[1].trim().toUpperCase();
  } else {
    // Look for standard formatting patterns if no label matched:
    // A. India Post consignment: 2 letters, 9 digits, 2 letters (e.g. EM123456789IN)
    const indiaPostMatch = text.match(/\b[a-z]{2}\d{9}[a-z]{2}\b/i);
    if (indiaPostMatch) {
      trackingId = indiaPostMatch[0].toUpperCase();
    } else {
      // B. Delhivery standard 12-digit
      const twelveDigitMatch = text.match(/\b\d{12}\b/);
      if (twelveDigitMatch) {
        trackingId = twelveDigitMatch[0];
      } else {
        // C. Standard 9-digit AWB (DTDC/Blue Dart)
        const nineDigitMatch = text.match(/\b\d{9}\b/);
        if (nineDigitMatch) {
          trackingId = nineDigitMatch[0];
        } else {
          // D. General 8-15 digit number
          const generalMatch = text.match(/\b\d{8,15}\b/);
          if (generalMatch) {
            trackingId = generalMatch[0];
          }
        }
      }
    }
  }

  // Cleanup tracking ID if it contains extraneous characters
  if (trackingId) {
    trackingId = trackingId.replace(/[^A-Z0-9\-_]/g, "");
  }

  return {
    carrierName: detectedCarrier ? detectedCarrier.name : "Unknown Carrier",
    trackingId
  };
};
