const fs = require('fs');
const path = require('path');

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
      walkDirectory(filePath, callback);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filePath);
    }
  });
}

let fixedCount = 0;

walkDirectory('app', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix @/app/lib/constante -> @/app/_lib/utils/constants
  content = content.replace(/@\/app\/lib\/constante/g, '@/app/_lib/utils/constants');
  
  // Fix @/app/_components/clients-catalogue/create-form -> @/app/_components/clients/create-form
  content = content.replace(/@\/app\/_components\/clients-catalogue\/create-form/g, '@/app/_components/clients/create-form');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}`);
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);
