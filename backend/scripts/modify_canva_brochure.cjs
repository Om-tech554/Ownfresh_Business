const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { PDFDocument, PDFRef, PDFName, PDFNumber } = require('../node_modules/pdf-lib');

async function updateBrochure() {
  const inputPdfPath = 'C:/Users/omkar/.gemini/antigravity/brain/52629ff3-1052-4102-87f7-1521a6a1d5a4/.user_uploaded/media_1793856144650_a51dd16e.pdf';
  console.log(`Reading original Canva brochure from: ${inputPdfPath}`);
  const pdfBytes = fs.readFileSync(inputPdfPath);
  const doc = await PDFDocument.load(pdfBytes);

  console.log(`PDF loaded. Total pages: ${doc.getPageCount()}`);

  function getStreamContent(objNum) {
    const obj = doc.context.lookup(PDFRef.of(objNum));
    const raw = obj.getContents();
    return zlib.inflateSync(Buffer.from(raw)).toString('latin1');
  }

  function setStreamContent(objNum, newContentStr) {
    const obj = doc.context.lookup(PDFRef.of(objNum));
    const compressed = zlib.deflateSync(Buffer.from(newContentStr, 'latin1'));
    obj.contents = compressed;
    obj.dict.set(PDFName.of('Length'), PDFNumber.of(compressed.length));
  }

  // ==========================================
  // PAGE 1: Obj 21
  // ==========================================
  let s21 = getStreamContent(21);
  console.log('Processing Page 1 (Obj 21)...');

  // 1. Subtitle: Traditional Cold Stone-Pressed -> Traditional Stone-Pressed
  // Shift Block 2 & 3 for centering (+15.5625)
  s21 = s21.replace('1 0 0 -1 7.09375 82 Tm', '1 0 0 -1 22.65625 82 Tm');
  s21 = s21.replace('1 0 0 -1 69.3125 82 Tm', '1 0 0 -1 84.875 82 Tm');

  // Remove Block 4 (Cold) & Block 5 (space)
  const b4Str = 'BT\n/F47 13.3299999 Tf\n1 0 0 -1 73.03125 82 Tm\n(\u0000&) Tj\n9.6228638 0 Td\n(\u0000R) Tj\n7.4104156 0 Td\n(\u0000O) Tj\n2.9588318 0 Td\n(\u0000G) Tj\nET';
  const b5Str = 'BT\n/F47 13.3299999 Tf\n1 0 0 -1 100.4375 82 Tm\n(\u0000\u0003) Tj\nET';
  s21 = s21.replace(b4Str, '');
  s21 = s21.replace(b5Str, '');

  // Shift Blocks 6..20 by -15.5625
  const p1Shifts = [
    { from: '1 0 0 -1 104.15625 82 Tm', to: '1 0 0 -1 88.59375 82 Tm' },
    { from: '1 0 0 -1 192.3125 82 Tm', to: '1 0 0 -1 176.75 82 Tm' },
    { from: '1 0 0 -1 196.03125 82 Tm', to: '1 0 0 -1 180.46875 82 Tm' },
    { from: '1 0 0 -1 240.48438 82 Tm', to: '1 0 0 -1 224.92188 82 Tm' },
    { from: '1 0 0 -1 244.20313 82 Tm', to: '1 0 0 -1 228.64063 82 Tm' },
    { from: '1 0 0 -1 272.35938 82 Tm', to: '1 0 0 -1 256.79688 82 Tm' },
    { from: '1 0 0 -1 276.07813 82 Tm', to: '1 0 0 -1 260.51563 82 Tm' },
    { from: '1 0 0 -1 313.125 82 Tm', to: '1 0 0 -1 297.5625 82 Tm' },
    { from: '1 0 0 -1 316.84375 82 Tm', to: '1 0 0 -1 301.28125 82 Tm' },
    { from: '1 0 0 -1 339.79688 82 Tm', to: '1 0 0 -1 324.23438 82 Tm' },
    { from: '1 0 0 -1 343.51563 82 Tm', to: '1 0 0 -1 327.95313 82 Tm' },
    { from: '1 0 0 -1 346.98438 82 Tm', to: '1 0 0 -1 331.42188 82 Tm' },
    { from: '1 0 0 -1 350.70313 82 Tm', to: '1 0 0 -1 335.14063 82 Tm' },
    { from: '1 0 0 -1 385.53125 82 Tm', to: '1 0 0 -1 369.96875 82 Tm' },
    { from: '1 0 0 -1 389.25 82 Tm', to: '1 0 0 -1 373.6875 82 Tm' }
  ];
  p1Shifts.forEach(sh => {
    s21 = s21.replace(sh.from, sh.to);
  });

  // 2. 100% Cold Stone-Pressed -> 100% Stone-Pressed
  const p1B28Target = '(\u0000&) Tj\n9.6228638 0 Td\n(\u0000R) Tj\n8.1434479 0 Td\n(\u0000O) Tj\n3.7052002 0 Td\n(\u0000G) Tj\n8.1434479 0 Td\n(\u0000\u0003) Tj\n3.7052002 0 Td\n(\u00006) Tj';
  s21 = s21.replace(p1B28Target, '(\u00006) Tj');

  // 3. * 1st Cold Stone Press -> * 1st Stone Press
  const p1B39Target = '(\u0000&) Tj\n8.6640625 0 Td\n(\u0000R) Tj\n7.3320465 0 Td\n(\u0000O) Tj\n3.3360291 0 Td\n(\u0000G) Tj\n7.3320465 0 Td\n(\u0000\u0003) Tj\n3.3360291 0 Td\n(\u00006) Tj';
  s21 = s21.replace(p1B39Target, '(\u00006) Tj');

  // 4. Footer seal banner: 100% COLD STONE-PRESSED -> 100% STONE-PRESSED
  const p1B64Target = '(\u0000&) Tj\n7.6938934 0 Td\n(\u00002) Tj\n8.2906494 0 Td\n(\u0000/) Tj\n6.5110321 0 Td\n(\u0000\') Tj\n7.6938934 0 Td\n(\u0000\u0003) Tj\n2.9624634 0 Td\n(\u00006) Tj';
  s21 = s21.replace(p1B64Target, '(\u00006) Tj');
  // Center the seal banner
  s21 = s21.replace('1 0 0 -1 0 9 Tm\n(\u00002) Tj', '1 0 0 -1 16.5759658 9 Tm\n(\u00002) Tj');

  setStreamContent(21, s21);
  console.log('Page 1 updated successfully.');

  // ==========================================
  // PAGE 2: Obj 24
  // ==========================================
  let s24 = getStreamContent(24);
  console.log('Processing Page 2 (Obj 24)...');

  // 5. Why Traditional Cold Stone-Pressed... -> Why Traditional Stone-Pressed...
  // Shift Block 2..5 for centering (+13.6796875)
  s24 = s24.replace('1 0 0 -1 0 10 Tm\n(\u0000:) Tj', '1 0 0 -1 13.6796875 10 Tm\n(\u0000:) Tj');
  s24 = s24.replace('1 0 0 -1 23.4375 10 Tm', '1 0 0 -1 37.1171875 10 Tm');
  s24 = s24.replace('1 0 0 -1 26.703125 10 Tm', '1 0 0 -1 40.3828125 10 Tm');
  s24 = s24.replace('1 0 0 -1 81.40625 10 Tm', '1 0 0 -1 95.0859375 10 Tm');

  // Remove Block 6 (Cold) & Block 7 (space)
  const b6Str = 'BT\n/F47 11.7299995 Tf\n1 0 0 -1 84.671875 10 Tm\n(\u0000&) Tj\n8.4609375 0 Td\n(\u0000R) Tj\n6.515625 0 Td\n(\u0000O) Tj\n2.6015625 0 Td\n(\u0000G) Tj\nET';
  const b7Str = 'BT\n/F47 11.7299995 Tf\n1 0 0 -1 108.765625 10 Tm\n(\u0000\u0003) Tj\nET';
  s24 = s24.replace(b6Str, '');
  s24 = s24.replace(b7Str, '');

  // Shift Blocks 8..20 by -13.6796875
  const p2Shifts = [
    { from: '1 0 0 -1 112.03125 10 Tm', to: '1 0 0 -1 98.3515625 10 Tm' },
    { from: '1 0 0 -1 189.54688 10 Tm', to: '1 0 0 -1 175.86719 10 Tm' },
    { from: '1 0 0 -1 192.8125 10 Tm', to: '1 0 0 -1 179.13281 10 Tm' },
    { from: '1 0 0 -1 237.76563 10 Tm', to: '1 0 0 -1 224.08594 10 Tm' },
    { from: '1 0 0 -1 241.03125 10 Tm', to: '1 0 0 -1 227.35156 10 Tm' },
    { from: '1 0 0 -1 279.48438 10 Tm', to: '1 0 0 -1 265.80469 10 Tm' },
    { from: '1 0 0 -1 282.75 10 Tm', to: '1 0 0 -1 269.07031 10 Tm' },
    { from: '1 0 0 -1 298.39063 10 Tm', to: '1 0 0 -1 284.71094 10 Tm' },
    { from: '1 0 0 -1 301.65625 10 Tm', to: '1 0 0 -1 287.97656 10 Tm' },
    { from: '1 0 0 -1 310.79688 10 Tm', to: '1 0 0 -1 297.11719 10 Tm' },
    { from: '1 0 0 -1 314.0625 10 Tm', to: '1 0 0 -1 300.38281 10 Tm' },
    { from: '1 0 0 -1 381.1875 10 Tm', to: '1 0 0 -1 367.50781 10 Tm' },
    { from: '1 0 0 -1 384.45313 10 Tm', to: '1 0 0 -1 370.77344 10 Tm' }
  ];
  p2Shifts.forEach(sh => {
    s24 = s24.replace(sh.from, sh.to);
  });

  // 6. Block 39: unadulterated cold stone-pressing oil -> unadulterated stone-pressing oil
  const p2B39Target = '(\u0000F) Tj\n5.328186 0 Td\n(\u0000R) Tj\n5.9249268 0 Td\n(\u0000O) Tj\n2.3657227 0 Td\n(\u0000G) Tj\n5.9249268 0 Td\n(\u0000\u0003) Tj\n2.9625244 0 Td\n(\u0000V) Tj';
  s24 = s24.replace(p2B39Target, '(\u0000V) Tj');

  // 7. Block 76: Cold Stone-Pressed strictly below 45 -> Stone-Pressed strictly below 45
  const p2B76Target = '(\u0000&) Tj\n7.219986 0 Td\n(\u0000R) Tj\n6.1100006 0 Td\n(\u0000O) Tj\n2.7799988 0 Td\n(\u0000G) Tj\n6.1100006 0 Td\n(\u0000\u0003) Tj\n2.7799988 0 Td\n(\u00006) Tj';
  s24 = s24.replace(p2B76Target, '(\u00006) Tj');

  setStreamContent(24, s24);
  console.log('Page 2 updated successfully.');

  // ==========================================
  // PAGE 3: Obj 27
  // ==========================================
  let s27 = getStreamContent(27);
  console.log('Processing Page 3 (Obj 27)...');

  // 8. Certified Cold Stone-Pressed -> Certified Stone-Pressed
  const p3B2Target = '(\u0000&) Tj\n8.4609375 0 Td\n(\u0000R) Tj\n6.515625 0 Td\n(\u0000O) Tj\n2.6015625 0 Td\n(\u0000G) Tj\n6.515625 0 Td\n(\u00006) Tj';
  s27 = s27.replace(p3B2Target, '(\u00006) Tj');
  // Center banner subtitle
  s27 = s27.replace('1 0 0 -1 0 10 Tm\n(\u0000&) Tj\n8.4609375 0 Td\n(\u0000H) Tj', '1 0 0 -1 12.046875 10 Tm\n(\u0000&) Tj\n8.4609375 0 Td\n(\u0000H) Tj');

  setStreamContent(27, s27);
  console.log('Page 3 updated successfully.');

  // ==========================================
  // PAGE 4: Obj 30
  // ==========================================
  let s30 = getStreamContent(30);
  console.log('Processing Page 4 (Obj 30)...');

  // 9. GUARANTEED 100% UNADULTERATED COLD STONE-PRESSED OIL -> GUARANTEED 100% UNADULTERATED STONE-PRESSED OIL
  const p4B27Target = '(\u0000&) Tj\n8.1789703 0 Td\n(\u00002) Tj\n8.8133545 0 Td\n(\u0000/) Tj\n6.9215393 0 Td\n(\u0000\') Tj\n8.1789703 0 Td\n(\u0000\u0003) Tj\n3.1492462 0 Td\n(\u00006) Tj';
  s30 = s30.replace(p4B27Target, '(\u00006) Tj');
  // Center seal banner
  s30 = s30.replace('1 0 0 -1 21.9375 9 Tm\n(\u0000*) Tj', '1 0 0 -1 39.5585 9 Tm\n(\u0000*) Tj');

  setStreamContent(30, s30);
  console.log('Page 4 updated successfully.');

  // Save the modified PDF
  const modifiedPdfBytes = await doc.save();
  console.log(`Modified PDF size: ${modifiedPdfBytes.length} bytes`);

  // Target paths:
  // User asked for: "Use a meaningful filename such as OwnFresh-Official-Brochure.pdf"
  const targets = [
    path.join(__dirname, '../../frontend/public/OwnFresh-Official-Brochure.pdf'),
    path.join(__dirname, '../../frontend/public/ownfresh_product_brochure.pdf'),
    path.join(__dirname, '../../frontend/dist/OwnFresh-Official-Brochure.pdf'),
    path.join(__dirname, '../../frontend/dist/ownfresh_product_brochure.pdf'),
    path.join(__dirname, '../../dist/OwnFresh-Official-Brochure.pdf'),
    path.join(__dirname, '../../dist/ownfresh_product_brochure.pdf')
  ];

  targets.forEach(dest => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, modifiedPdfBytes);
    console.log(`✅ Saved to: ${dest}`);
  });
}

updateBrochure().catch(err => {
  console.error('Error modifying brochure:', err);
  process.exit(1);
});
