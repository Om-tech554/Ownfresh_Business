import fs from 'fs';

const fullCatalog = JSON.parse(fs.readFileSync('d:/Oil_Business/backend/data_backup/products_full_catalog.json', 'utf8'));
const combos = fullCatalog.filter(p => p.name.toLowerCase().includes('combo') || (p.categories && p.categories.some(c => c.name.toLowerCase().includes('combo'))));

for (let i = 0; i < combos.length; i++) {
  const c = combos[i];
  console.log(`\n=================== COMBO #${i + 1} ===================`);
  console.log(`Name: ${c.name}`);
  console.log(`Description:\n${c.description}`);
}
