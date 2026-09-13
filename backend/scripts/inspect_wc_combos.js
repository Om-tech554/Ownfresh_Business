import fs from 'fs';

const fullCatalog = JSON.parse(fs.readFileSync('d:/Oil_Business/backend/data_backup/products_full_catalog.json', 'utf8'));
const combos = fullCatalog.filter(p => p.name.toLowerCase().includes('combo') || (p.categories && p.categories.some(c => c.name.toLowerCase().includes('combo'))));

console.log(`Found ${combos.length} combos in WooCommerce backup:\n`);
for (const c of combos) {
  console.log(`ID: ${c.id}`);
  console.log(`Name: ${c.name}`);
  console.log(`Price: ${c.price}, Regular: ${c.regular_price}, Sale: ${c.sale_price}`);
  console.log(`Short Desc: ${c.short_description}`);
  console.log(`Description: ${c.description ? c.description.slice(0, 150) : ''}...`);
  console.log('---');
}
