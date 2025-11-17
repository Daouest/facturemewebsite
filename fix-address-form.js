const fs = require('fs');

const file = 'app/_components/forms/EditAddressForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix imports
content = content.replace(/";import /g, '";\nimport ');
content = content.replace(/";export /g, '";\n\nexport ');

// Fix function body
content = content.replace(/\) \{  const /g, ') {\n  const ');
content = content.replace(/;  const /g, ';\n  const ');
content = content.replace(/;  \/\/ /g, ';\n  // ');
content = content.replace(/  \};  /g, '  };\n  ');
content = content.replace(/  \}  /g, '  }\n  ');
content = content.replace(/\);  \}/g, ');\n  }');
content = content.replace(/  \};  async /g, '  };\n\n  async ');
content = content.replace(/\(    /g, '(\n    ');
content = content.replace(/  return \(/g, '\n  return (');
content = content.replace(/\);\}/g, ');\n}');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed EditAddressForm.tsx');
