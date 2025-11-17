const fs = require('fs');

const file = 'app/_components/forms/AuthForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the broken patterns from previous script
content = content.replace(/if \(\$3/g, 'if (');

// Fix missing line breaks in multiline statements
content = content.replace(/;    ([a-z]\w+:)/g, ';\n    $1');

// Fix useEffect dependency arrays
content = content.replace(/\}(\s*,\s*\[)/g, '}\n$1');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed AuthForm.tsx - Round 2');
