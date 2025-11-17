const fs = require('fs');

const file = 'app/_components/forms/AuthForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix missing line breaks after closing braces and semicolons before variable declarations
content = content.replace(/;  (const |let |var )/g, ';\n  $1');
content = content.replace(/}  (const |let |var |async |if |return )/g, '}\n  $1');

// Fix missing line breaks in object properties
content = content.replace(/;    ([a-z])/g, ';\n    $1');

// Fix missing line breaks before closing braces in dependency arrays
content = content.replace(/}(\s*,\s*\[)/g, '}\n$1');

// Fix try-catch blocks
content = content.replace(/\)(\s*)(if \()/g, ');\n$2$3');
content = content.replace(/}(\s*)(catch )/g, '}\n$2');

// Fix specific patterns found in the error list
content = content.replace(/\);(\s*)(const |if |return )/g, ');\n$2');

// Save the fixed content
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed AuthForm.tsx');
