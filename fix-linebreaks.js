const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/_lib/database/models.ts',
  'app/_lib/helpers/calendar-audit.ts',
  'app/_lib/helpers/calendar-token.ts',
  'app/_lib/session/session-mw.ts',
  'app/_lib/types/invoice-types.ts',
  'app/_components/forms/AuthForm.tsx',
];

function fixLineBreaks(content) {
  let fixed = content;
  
  // Fix import statements
  fixed = fixed.replace(/import\s+(['"][^'"]+['"])(import\s)/g, 'import $1\n$2');
  fixed = fixed.replace(/;(import\s)/g, ';\n$1');
  
  // Fix exports
  fixed = fixed.replace(/;(export\s)/g, ';\n$1');
  fixed = fixed.replace(/}(export\s)/g, '}\n\n$1');
  
  // Fix function declarations
  fixed = fixed.replace(/}(const\s)/g, '}\n\n$1');
  fixed = fixed.replace(/}(function\s)/g, '}\n\n$1');
  fixed = fixed.replace(/}(async\s+function)/g, '}\n\n$1');
  
  // Fix comments
  fixed = fixed.replace(/;(\/\/[^\n]+)/g, ';\n$1');
  fixed = fixed.replace(/}(\/\/[^\n]+)/g, '}\n$1');
  
  // Fix Schema declarations
  fixed = fixed.replace(/\);(const\s+\w+Schema\s*=)/g, ');\n\n$1');
  
  return fixed;
}

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixLineBreaks(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✓ Fixed ${file}`);
    } else {
      console.log(`- No changes needed for ${file}`);
    }
  } else {
    console.log(`✗ File not found: ${file}`);
  }
});

console.log('\nDone!');
