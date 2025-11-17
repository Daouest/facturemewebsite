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
  
  // Fix @/app/lib/data -> @/app/_lib/database/queries
  content = content.replace(/@\/app\/lib\/data/g, '@/app/_lib/database/queries');
  
  // Fix @/app/lib/db/mongodb -> @/app/_lib/database/mongodb
  content = content.replace(/@\/app\/lib\/db\/mongodb/g, '@/app/_lib/database/mongodb');
  
  // Fix @/app/lib/models -> @/app/_lib/database/models
  content = content.replace(/@\/app\/lib\/models/g, '@/app/_lib/database/models');
  
  // Fix @/app/lib/schemas/ -> @/app/_lib/schemas/
  content = content.replace(/@\/app\/lib\/schemas\//g, '@/app/_lib/schemas/');
  
  // Fix @/app/lib/db/getNextSeq -> @/app/_lib/database/sequence-generator
  content = content.replace(/@\/app\/lib\/db\/getNextSeq/g, '@/app/_lib/database/sequence-generator');
  
  // Fix @/app/lib/session/ -> @/app/_lib/session/
  content = content.replace(/@\/app\/lib\/session\//g, '@/app/_lib/session/');
  
  // Fix @/app/lib/definitions -> @/app/_lib/types/definitions
  content = content.replace(/@\/app\/lib\/definitions/g, '@/app/_lib/types/definitions');
  
  // Fix ./lib/session -> ./_lib/session
  content = content.replace(/\.\/lib\/session/g, './_lib/session');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}`);
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);
