const fs = require('fs');
const path = require('path');

const corruptedFiles = [
  'app/_components/clients/create-form.tsx',
  'app/_components/features/adminAcceuil.tsx',
  'app/_components/forms/AuthForm.tsx',
  'app/_components/forms/EditBusinessForm.tsx',
  'app/_components/forms/EditProfileForm.tsx',
  'app/_components/forms/FormCreationHourlyRate.tsx',
  'app/_components/forms/formCreationItem.tsx',
  'app/_components/forms/formDetailItem.tsx',
  'app/_components/forms/formDetailsHourlyRate.tsx',
  'app/_components/invoices/InvoiceCreationForm.tsx',
  'app/_components/invoices/ItemsList.tsx',
  'app/_components/invoices/pdf-invoice.tsx',
  'app/_components/layout/Sidebar.tsx',
  'app/_components/shared/AddressAutocomplete.tsx',
  'app/_components/shared/TextType.tsx',
  'app/_components/ui/PageTemplate.tsx',
  'app/_lib/actions/invoice-creation-actions.ts',
  'app/_lib/database/models.ts',
  'app/_lib/database/queries.ts',
  'app/_lib/helpers/invoice-helpers.ts',
  'app/_lib/utils/constants.ts',
  'app/_lib/utils/format.ts',
];

function addBasicLineBreaks(content) {
  let formatted = content;
  formatted = formatted.replace(/;import /g, ';\nimport ');
  formatted = formatted.replace(/;export /g, ';\n\nexport ');
  formatted = formatted.replace(/;type /g, ';\n\ntype ');
  formatted = formatted.replace(/;const /g, ';\nconst ');
  formatted = formatted.replace(/;let /g, ';\nlet ');
  formatted = formatted.replace(/;function /g, ';\n\nfunction ');
  formatted = formatted.replace(/\{/g, '{\n');
  formatted = formatted.replace(/\}/g, '\n}\n');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  return formatted;
}

console.log('Restoring line breaks...');
console.log('');
for (const file of corruptedFiles) {
  const filePath = path.join(__dirname, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lineCount = content.split('\n').length;
    if (lineCount > 5) {
      console.log('Skip ' + file + ' - ' + lineCount + ' lines');
      continue;
    }
    console.log('Processing ' + file + '...');
    const formatted = addBasicLineBreaks(content);
    fs.writeFileSync(filePath, formatted, 'utf8');
    console.log('Done - ' + formatted.split('\n').length + ' lines');
    console.log('');
  } catch (error) {
    console.error('Error ' + file + ': ' + error.message);
  }
}
console.log('Finished!');
