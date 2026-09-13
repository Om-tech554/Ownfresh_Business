import fs from 'fs';

const fullCatalog = JSON.parse(fs.readFileSync('d:/Oil_Business/backend/data_backup/products_full_catalog.json', 'utf8'));
const combos = fullCatalog.filter(p => p.name.toLowerCase().includes('combo') || (p.categories && p.categories.some(c => c.name.toLowerCase().includes('combo'))));

for (let i = 0; i < Math.min(5, combos.length); i++) {
  const c = combos[i];
  console.log(`\n=================== COMBO #${i + 1} ===================`);
  console.log(`Name: ${c.name}`);
  console.log(`Short description: ${c.short_description}`);
  if (c.attributes) console.log(`Attributes:`, JSON.stringify(c.attributes));
  if (c.images) console.log(`Images:`, c.images.map(img => img.src));
}
