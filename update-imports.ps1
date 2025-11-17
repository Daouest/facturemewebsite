# Script to update all imports after folder restructuring

$replacements = @{
    # Main folders
    '@/app/lib/' = '@/lib/'
    '@/app/components/' = '@/components/'
    '@/app/context/' = '@/context/'
    
    # Specific lib subfolder updates
    'from "@/app/lib/db/mongodb"' = 'from "@/lib/database/mongodb"'
    "from '@/app/lib/db/mongodb'" = "from '@/lib/database/mongodb'"
    'from "@/app/lib/models"' = 'from "@/lib/database/models"'
    "from '@/app/lib/models'" = "from '@/lib/database/models'"
    'from "@/app/lib/data"' = 'from "@/lib/database/queries"'
    "from '@/app/lib/data'" = "from '@/lib/database/queries'"
    'from "@/app/lib/type-guards"' = 'from "@/lib/database/type-guards"'
    "from '@/app/lib/type-guards'" = "from '@/lib/database/type-guards'"
    'from "@/app/lib/db/sequence-generator"' = 'from "@/lib/database/sequence-generator"'
    "from '@/app/lib/db/sequence-generator'" = "from '@/lib/database/sequence-generator'"
    'from "@/app/lib/db/fetch-helpers"' = 'from "@/lib/database/fetch-helpers"'
    "from '@/app/lib/db/fetch-helpers'" = "from '@/lib/database/fetch-helpers'"
    'from "@/app/lib/db/getNextSeq"' = 'from "@/lib/database/getNextSeq"'
    "from '@/app/lib/db/getNextSeq'" = "from '@/lib/database/getNextSeq'"
    
    # Email folder
    'from "@/app/lib/emails/' = 'from "@/lib/email/'
    "from '@/app/lib/emails/" = "from '@/lib/email/"
    
    # Helpers
    'from "@/app/lib/invoice-helpers"' = 'from "@/lib/helpers/invoice-helpers"'
    "from '@/app/lib/invoice-helpers'" = "from '@/lib/helpers/invoice-helpers'"
    'from "@/app/lib/form-utils"' = 'from "@/lib/helpers/form-utils"'
    "from '@/app/lib/form-utils'" = "from '@/lib/helpers/form-utils'"
    'from "@/app/lib/calendar-token"' = 'from "@/lib/helpers/calendar-token"'
    "from '@/app/lib/calendar-token'" = "from '@/lib/helpers/calendar-token'"
    'from "@/app/lib/calendar-audit"' = 'from "@/lib/helpers/calendar-audit"'
    "from '@/app/lib/calendar-audit'" = "from '@/lib/helpers/calendar-audit'"
    
    # Utils
    'from "@/app/lib/utils"' = 'from "@/lib/utils/format"'
    "from '@/app/lib/utils'" = "from '@/lib/utils/format'"
    'from "@/app/lib/constante"' = 'from "@/lib/utils/constants"'
    "from '@/app/lib/constante'" = "from '@/lib/utils/constants'"
    'from "@/app/lib/requireAuth"' = 'from "@/lib/utils/auth"'
    "from '@/app/lib/requireAuth'" = "from '@/lib/utils/auth'"
    
    # Types
    'from "@/app/lib/definitions"' = 'from "@/lib/types/definitions"'
    "from '@/app/lib/definitions'" = "from '@/lib/types/definitions'"
    
    # Context renames
    'from "@/app/context/ReactQueryWrapper"' = 'from "@/context/query-provider"'
    "from '@/app/context/ReactQueryWrapper'" = "from '@/context/query-provider'"
    'from "@/app/context/UserContext"' = 'from "@/context/user-provider"'
    "from '@/app/context/UserContext'" = "from '@/context/user-provider'"
    'from "@/app/context/langageContext"' = 'from "@/context/language-provider"'
    "from '@/app/context/langageContext'" = "from '@/context/language-provider'"
    'from "@/app/context/SidebarContext"' = 'from "@/context/sidebar-provider"'
    "from '@/app/context/SidebarContext'" = "from '@/context/sidebar-provider'"
    'from "@/app/context/FormContext"' = 'from "@/context/form-provider"'
    "from '@/app/context/FormContext'" = "from '@/context/form-provider'"
    'from "@/app/context/HourlyRateFormContext"' = 'from "@/context/hourly-rate-form-provider"'
    "from '@/app/context/HourlyRateFormContext'" = "from '@/context/hourly-rate-form-provider'"
}

# Get all TypeScript and TSX files (excluding node_modules and .next)
$files = Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx,*.md -Recurse | 
    Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.next\\' }

$totalFiles = $files.Count
$updatedFiles = 0
$totalReplacements = 0

Write-Host "Found $totalFiles files to process..." -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $fileReplacements++
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updatedFiles++
        $totalReplacements += $fileReplacements
        Write-Host "  Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nDone!" -ForegroundColor Green
Write-Host "Updated $updatedFiles files with $totalReplacements replacements" -ForegroundColor Cyan
