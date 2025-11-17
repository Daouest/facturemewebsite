const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(filePath);
    }
  });
}

let count = 0;
walkDir('./app', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Replace @/context/ with @/app/_context/
  content = content.replace(/from ["']@\/context\//g, 'from "@/app/_context/');
  content = content.replace(/import ["']@\/context\//g, 'import "@/app/_context/');
  
  // Replace @/components/ with @/app/_components/
  content = content.replace(/from ["']@\/components\//g, 'from "@/app/_components/');
  content = content.replace(/import ["']@\/components\//g, 'import "@/app/_components/');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed: ' + filePath);
    count++;
  }
});

console.log('\nDone! Fixed ' + count + ' files');
