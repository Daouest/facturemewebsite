const fs = require('fs');

const file = 'app/_components/forms/AuthForm.tsx';
const content = fs.readFileSync(file, 'utf8');

let fixed = content;

// Fix common patterns where line breaks are missing
fixed = fixed.replace(/;\s\s([a-z])/g, ';\n  $1'); // After semicolons before lowercase
fixed = fixed.replace(/\)\s\s([a-z])/g, ')\n  $1'); // After closing parens before lowercase
fixed = fixed.replace(/\}\s\s(const |let |var |function |async |if |return |import |export )/g, '}\n\n  $1'); // After closing braces before declarations
fixed = fixed.replace(/\);\s\s(const |let |var |function |async |if |return )/g, ');\n\n  $1'); // After function calls before declarations
fixed = fixed.replace(/;\s\s(\/\/)/g, ';\n  $1'); // After semicolons before comments

fs.writeFileSync(file, fixed, 'utf8');
console.log('Fixed AuthForm.tsx');
