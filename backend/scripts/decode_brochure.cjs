const fs = require('fs');
const zlib = require('zlib');

function runDecoder(pdfPath, label) {
  const str = fs.readFileSync(pdfPath, 'latin1');

  function getCMap(tuNum) {
    const m = str.match(new RegExp('(?:^|\\n)' + tuNum + '\\s+0\\s+obj[\\s\\S]*?stream\\r?\\n([\\s\\S]*?)\\r?\\nendstream'));
    if (!m) return {};
    const def = zlib.inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1');
    const map = {};
    const rangeRe = /<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]{4})>/g;
    let rm;
    while ((rm = rangeRe.exec(def)) !== null) {
      const s = parseInt(rm[1], 16), e = parseInt(rm[2], 16), b = parseInt(rm[3], 16);
      for (let i = 0; i <= e - s; i++) map[s + i] = String.fromCharCode(b + i);
    }
    const charRe = /<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]{4})>/g;
    while ((rm = charRe.exec(def)) !== null) {
      map[parseInt(rm[1], 16)] = String.fromCharCode(parseInt(rm[2], 16));
    }
    return map;
  }

  const pageConfigs = [
    { page: 1, obj: 21, fonts: { '/F46': getCMap(774), '/F47': getCMap(776) } },
    { page: 2, obj: 24, fonts: { '/F46': getCMap(778), '/F47': getCMap(780) } },
    { page: 3, obj: 27, fonts: { '/F57': getCMap(782), '/F58': getCMap(784), '/F59': getCMap(786) } },
    { page: 4, obj: 30, fonts: { '/F37': getCMap(788), '/F38': getCMap(790) } }
  ];

  function extractPageText(streamStr, fonts) {
    const blocks = [];
    const btRe = /BT([\s\S]*?)ET/g;
    let btm;
    while ((btm = btRe.exec(streamStr)) !== null) {
      const b = btm[1];
      let curFont = fonts['/F47'] || fonts['/F38'] || fonts['/F58'];
      let blockText = '';
      const tokenRe = /(\/F\d+)\s+[\d\.]+\s+Tf|\(([^\)]*)\)\s*Tj/g;
      let tm;
      while ((tm = tokenRe.exec(b)) !== null) {
        if (tm[1] && fonts[tm[1]]) {
          curFont = fonts[tm[1]];
        } else if (tm[2] !== undefined && curFont) {
          const raw = Buffer.from(tm[2], 'latin1');
          for (let i = 0; i < raw.length; i += 2) {
            const code = (raw[i] << 8) | (raw[i+1] || 0);
            blockText += curFont[code] || ('[' + code.toString(16) + ']');
          }
        }
      }
      if (blockText.trim()) blocks.push(blockText.trim());
    }
    return blocks;
  }

  console.log(`\n======================================================`);
  console.log(`DECODING ${label}: ${pdfPath}`);
  console.log(`======================================================`);

  pageConfigs.forEach(cfg => {
    const m = str.match(new RegExp('(?:^|\\n)' + cfg.obj + '\\s+0\\s+obj[\\s\\S]*?stream\\r?\\n([\\s\\S]*?)\\r?\\nendstream'));
    if (!m) {
      console.log(`Page ${cfg.page} (Obj ${cfg.obj}) not found`);
      return;
    }
    const stream = zlib.inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1');
    const blocks = extractPageText(stream, cfg.fonts);
    console.log(`\n--- PAGE ${cfg.page} (Obj ${cfg.obj}) Text blocks: ${blocks.length} ---`);
    blocks.forEach((blk, i) => {
      const lower = blk.toLowerCase();
      if (lower.includes('cold') || lower.includes('stone') || lower.includes('cloud') || lower.includes('press') || lower.includes('guarant') || lower.includes('unadult')) {
        console.log(`  [Block ${i}]: "${blk}"`);
      }
    });
  });
}

// 1. Run on original Canva PDF
runDecoder(
  'C:/Users/omkar/.gemini/antigravity/brain/52629ff3-1052-4102-87f7-1521a6a1d5a4/.user_uploaded/media_1793856144650_a51dd16e.pdf',
  'ORIGINAL CANVA PDF'
);

// 2. Run on modified PDF
runDecoder(
  'frontend/public/OwnFresh-Official-Brochure.pdf',
  'MODIFIED BROCHURE PDF'
);

