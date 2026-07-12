const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src');

const replacements = [
  { regex: /Botanic Stone/gi },
  { regex: /cold-pressed/gi },
  { regex: /cold pressed/gi },
  { regex: /cold press/gi },
  { regex: /Cold Pressing/gi }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = false;

      for (const { regex } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, (match) => {
             if (match === 'cold-pressed') return 'stone-pressed';
             if (match === 'Cold-pressed') return 'Stone-pressed';
             if (match === 'Cold-Pressed') return 'Stone-Pressed';
             if (match === 'COLD-PRESSED') return 'STONE-PRESSED';
             
             if (match === 'cold pressed') return 'stone pressed';
             if (match === 'Cold pressed') return 'Stone pressed';
             if (match === 'Cold Pressed') return 'Stone Pressed';
             if (match === 'COLD PRESSED') return 'STONE PRESSED';

             if (match === 'cold press') return 'stone press';
             if (match === 'Cold press') return 'Stone press';
             if (match === 'Cold Press') return 'Stone Press';

             if (match === 'cold pressing') return 'stone pressing';
             if (match === 'Cold pressing') return 'Stone pressing';
             if (match === 'Cold Pressing') return 'Stone Pressing';
             
             if (match === 'Botanic Stone') return 'Botanic Purity';
             if (match === 'botanic stone') return 'botanic purity';

             return match;
          });
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Replacement complete.');
