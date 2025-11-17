const fs = require('fs');
const path = require('path');

const replacements = [
  // Components - specific ones first
  { from: /@\/app\/components\/AuthForm/g, to: '@/components/forms/AuthForm' },
  { from: /@\/components\/AuthForm/g, to: '@/components/forms/AuthForm' },
  { from: /@\/app\/components\/Header/g, to: '@/components/layout/Header' },
  { from: /@\/components\/Header/g, to: '@/components/layout/Header' },
  { from: /@\/app\/components\/Footer/g, to: '@/components/layout/Footer' },
  { from: /@\/components\/Footer/g, to: '@/components/layout/Footer' },
  { from: /@\/app\/components\/Sidebar/g, to: '@/components/layout/Sidebar' },
  { from: /@\/components\/Sidebar/g, to: '@/components/layout/Sidebar' },
  { from: /@\/app\/components\/MobileSidebarWrapper/g, to: '@/components/layout/MobileSidebarWrapper' },
  { from: /@\/components\/MobileSidebarWrapper/g, to: '@/components/layout/MobileSidebarWrapper' },
  { from: /@\/app\/components\/Button/g, to: '@/components/shared/Button' },
  { from: /@\/components\/Button/g, to: '@/components/shared/Button' },
  { from: /@\/app\/components\/ActionsCard/g, to: '@/components/features/ActionsCard' },
  { from: /@\/components\/ActionsCard/g, to: '@/components/features/ActionsCard' },
  { from: /@\/app\/components\/lastFactures/g, to: '@/components/features/lastFactures' },
  { from: /@\/components\/lastFactures/g, to: '@/components/features/lastFactures' },
  { from: /@\/app\/components\/adminAcceuil/g, to: '@/components/features/adminAcceuil' },
  { from: /@\/components\/adminAcceuil/g, to: '@/components/features/adminAcceuil' },
  { from: /@\/app\/components\/stats/g, to: '@/components/features/stats' },
  { from: /@\/components\/stats/g, to: '@/components/features/stats' },
  { from: /@\/app\/components\/formCreationItem/g, to: '@/components/forms/formCreationItem' },
  { from: /@\/components\/formCreationItem/g, to: '@/components/forms/formCreationItem' },
  { from: /@\/app\/components\/FormCreationHourlyRate/g, to: '@/components/forms/FormCreationHourlyRate' },
  { from: /@\/components\/FormCreationHourlyRate/g, to: '@/components/forms/FormCreationHourlyRate' },
  { from: /@\/app\/components\/formDetailItem/g, to: '@/components/forms/formDetailItem' },
  { from: /@\/components\/formDetailItem/g, to: '@/components/forms/formDetailItem' },
  { from: /@\/app\/components\/formDetailsHourlyRate/g, to: '@/components/forms/formDetailsHourlyRate' },
  { from: /@\/components\/formDetailsHourlyRate/g, to: '@/components/forms/formDetailsHourlyRate' },
  
  // Components - generic (after specific ones)
  { from: /@\/app\/components\//g, to: '@/components/' },
  
  // Context - specific ones first
  { from: /@\/app\/context\/UserContext/g, to: '@/context/user-provider' },
  { from: /@\/context\/UserContext/g, to: '@/context/user-provider' },
  { from: /@\/app\/context\/langageContext/g, to: '@/context/language-provider' },
  { from: /@\/context\/langageContext/g, to: '@/context/language-provider' },
  { from: /@\/app\/context\/SidebarContext/g, to: '@/context/sidebar-provider' },
  { from: /@\/context\/SidebarContext/g, to: '@/context/sidebar-provider' },
  { from: /@\/app\/context\/FormContext/g, to: '@/context/form-provider' },
  { from: /@\/context\/FormContext/g, to: '@/context/form-provider' },
  { from: /@\/app\/context\/HourlyRateFormContext/g, to: '@/context/hourly-rate-form-provider' },
  { from: /@\/context\/HourlyRateFormContext/g, to: '@/context/hourly-rate-form-provider' },
  { from: /@\/app\/context\/ReactQueryWrapper/g, to: '@/context/query-provider' },
  { from: /@\/context\/ReactQueryWrapper/g, to: '@/context/query-provider' },
  
  // Context - generic (after specific ones)
  { from: /@\/app\/context\//g, to: '@/context/' },
  
  // Database
  { from: /@\/app\/lib\/db\/mongodb/g, to: '@/lib/database/mongodb' },
  { from: /@\/app\/lib\/db\/getNextSeq/g, to: '@/lib/database/getNextSeq' },
  { from: /@\/app\/lib\/db\/sequence-generator/g, to: '@/lib/database/sequence-generator' },
  { from: /@\/app\/lib\/db\/fetch-helpers/g, to: '@/lib/database/fetch-helpers' },
  { from: /@\/app\/lib\/models/g, to: '@/lib/database/models' },
  { from: /@\/app\/lib\/data/g, to: '@/lib/database/queries' },
  { from: /@\/app\/lib\/type-guards/g, to: '@/lib/database/type-guards' },
  // Email
  { from: /@\/app\/lib\/emails\//g, to: '@/lib/email/' },
  // Helpers
  { from: /@\/app\/lib\/invoice-helpers/g, to: '@/lib/helpers/invoice-helpers' },
  { from: /@\/app\/lib\/form-utils/g, to: '@/lib/helpers/form-utils' },
  { from: /@\/app\/lib\/calendar-token/g, to: '@/lib/helpers/calendar-token' },
  { from: /@\/app\/lib\/calendar-audit/g, to: '@/lib/helpers/calendar-audit' },
  // Utils
  { from: /@\/app\/lib\/utils/g, to: '@/lib/utils/format' },
  { from: /@\/app\/lib\/constante/g, to: '@/lib/utils/constants' },
  { from: /@\/app\/lib\/requireAuth/g, to: '@/lib/utils/auth' },
  // Types
  { from: /@\/app\/lib\/definitions/g, to: '@/lib/types/definitions' },
  // Schemas
  { from: /@\/app\/lib\/schemas\//g, to: '@/lib/schemas/' },
  // Session
  { from: /@\/app\/lib\/session\//g, to: '@/lib/session/' },
  // Actions
  { from: /@\/app\/lib\/actions\//g, to: '@/lib/actions/' },
  // Hooks
  { from: /@\/app\/lib\/hooks\//g, to: '@/lib/hooks/' },
  // API
  { from: /@\/app\/lib\/api\//g, to: '@/lib/api/' },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ ${filePath}`);
      return 1;
    }
    return 0;
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
    return 0;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '_old_routes') {
        walkDir(filePath, fileList);
      }
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const dirs = ['app', 'components', 'middleware.ts'];
let totalFiles = 0;
let modifiedFiles = 0;

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.statSync(dir).isDirectory() ? walkDir(dir) : [dir];
    totalFiles += files.length;
    files.forEach(file => {
      modifiedFiles += processFile(file);
    });
  }
});

console.log(`\n✓ Done! Modified ${modifiedFiles} out of ${totalFiles} files`);
