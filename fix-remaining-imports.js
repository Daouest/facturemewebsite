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
  
  // Fix @/app/lib/utils -> @/app/_lib/utils/format
  content = content.replace(/@\/app\/lib\/utils/g, '@/app/_lib/utils/format');
  
  // Fix @/app/ui/ -> @/app/_components/
  content = content.replace(/@\/app\/ui\//g, '@/app/_components/');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}`);
    fixedCount++;
  }
});

// Also fix shadcn UI components
walkDirectory('components', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix @/app/lib/utils -> @/app/_lib/utils/format
  content = content.replace(/@\/app\/lib\/utils/g, '@/app/_lib/utils/format');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}`);
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);
