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
  
  // Fix shadcn UI imports - should be from root components/ui not app/_components/ui
  content = content.replace(/from ["']@\/app\/_components\/ui\/(table|switch|button|badge|alert)["']/g, 'from "@/components/ui/$1"');
  content = content.replace(/import ["']@\/app\/_components\/ui\/(table|switch|button|badge|alert)["']/g, 'import "@/components/ui/$1"');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed: ' + filePath);
    count++;
  }
});

console.log('\nDone! Fixed ' + count + ' files');
