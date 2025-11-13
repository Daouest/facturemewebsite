# Next.js Project Restructuring Plan
**Date**: November 13, 2025  
**Objective**: Optimize folder structure for better Next.js performance, developer experience, and maintainability

---

## 📊 Current Structure Analysis

### **Problems Identified:**
1. ❌ **Mixed concerns**: `app/lib` contains database, utils, types, actions all mixed
2. ❌ **Inconsistent naming**: Some folders use kebab-case, others use camelCase
3. ❌ **Deep nesting**: `app/components/features/invoices/` is confusing
4. ❌ **Unclear separation**: Context, hooks, schemas scattered in lib
5. ❌ **Old routes**: `_old_routes` folder should be removed
6. ❌ **Duplicate structures**: `components/` both in root and app
7. ❌ **Poor colocation**: API routes far from related components

---

## 🎯 Optimal Next.js Structure (2024+ Best Practices)

```
facturemewebsite/
├── app/
│   ├── (auth)/                          # Route group for auth pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── email/
│   │
│   ├── (marketing)/                     # Route group for public pages
│   │   └── about/
│   │
│   ├── [lang]/                          # i18n support
│   │   └── (app)/                       # Main app route group
│   │       ├── layout.tsx               # App shell with sidebar
│   │       ├── dashboard/
│   │       ├── invoices/
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   ├── [id]/
│   │       │   ├── _components/         # Route-specific components
│   │       │   └── _hooks/              # Route-specific hooks
│   │       ├── products/
│   │       ├── clients/
│   │       ├── rates/
│   │       ├── calendar/
│   │       ├── profile/
│   │       └── admin/
│   │
│   ├── api/                             # API routes (keep as-is, already optimized)
│   │   ├── auth/
│   │   ├── invoices/
│   │   ├── profile/
│   │   └── _lib/                        # API-specific helpers (NEW)
│   │
│   ├── _components/                     # Global shared components
│   │   ├── ui/                          # Primitive UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── select.tsx
│   │   ├── forms/                       # Reusable form components
│   │   │   ├── form-input.tsx
│   │   │   ├── form-alert.tsx
│   │   │   ├── radio-group.tsx
│   │   │   └── loading-button.tsx
│   │   ├── layout/                      # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── mobile-sidebar.tsx
│   │   └── features/                    # Feature-specific shared components
│   │       ├── stats-card.tsx
│   │       ├── actions-card.tsx
│   │       └── ticket-list.tsx
│   │
│   ├── _lib/                            # Shared utilities (RESTRUCTURED)
│   │   ├── actions/                     # Server actions
│   │   │   ├── invoice-actions.ts
│   │   │   ├── client-actions.ts
│   │   │   └── profile-actions.ts
│   │   │
│   │   ├── api/                         # API utilities (already created)
│   │   │   ├── error-handler.ts
│   │   │   ├── auth-middleware.ts
│   │   │   ├── cache-helpers.ts
│   │   │   ├── etag-helpers.ts
│   │   │   └── request-helpers.ts
│   │   │
│   │   ├── database/                    # Database layer
│   │   │   ├── mongodb.ts
│   │   │   ├── models.ts
│   │   │   ├── queries.ts               # Renamed from data.ts
│   │   │   ├── sequence-generator.ts
│   │   │   ├── fetch-helpers.ts
│   │   │   └── type-guards.ts
│   │   │
│   │   ├── email/                       # Email system
│   │   │   ├── gmail.ts
│   │   │   ├── token.ts
│   │   │   └── templates.ts
│   │   │
│   │   ├── session/                     # Session management
│   │   │   ├── session-crypto.ts
│   │   │   └── session-node.ts
│   │   │
│   │   ├── schemas/                     # Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── invoice.ts
│   │   │   ├── client.ts
│   │   │   └── env.ts
│   │   │
│   │   ├── types/                       # TypeScript types
│   │   │   ├── invoice-types.ts
│   │   │   ├── user-types.ts
│   │   │   ├── item-types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                       # Custom React hooks
│   │   │   ├── use-app-router.ts
│   │   │   ├── use-invoice-form.ts
│   │   │   └── use-debounce.ts
│   │   │
│   │   ├── utils/                       # Pure utility functions
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── helpers/                     # Business logic helpers
│   │       ├── invoice-helpers.ts
│   │       ├── calendar-helpers.ts
│   │       └── form-utils.ts
│   │
│   ├── _context/                        # React context providers
│   │   ├── query-provider.tsx          # React Query
│   │   ├── user-provider.tsx
│   │   ├── language-provider.tsx
│   │   ├── sidebar-provider.tsx
│   │   └── form-provider.tsx
│   │
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Root page (redirect)
│   ├── not-found.tsx
│   ├── error.tsx
│   └── globals.css
│
├── public/                              # Static assets
│   ├── images/
│   └── fonts/
│
├── components/                          # Shadcn/UI components (if using)
│   └── ui/
│
├── middleware.ts                        # Next.js middleware
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔄 Migration Steps

### **Phase 1: Reorganize `app/lib/` → `app/_lib/`** ✅ PRIORITY

#### **Step 1.1: Create new structure**
```bash
mkdir app/_lib/database
mkdir app/_lib/email
mkdir app/_lib/utils
mkdir app/_lib/helpers
```

#### **Step 1.2: Move and rename files**
| Old Path | New Path | Reason |
|----------|----------|--------|
| `lib/db/mongodb.ts` | `_lib/database/mongodb.ts` | Clearer grouping |
| `lib/models.ts` | `_lib/database/models.ts` | Database-related |
| `lib/data.ts` | `_lib/database/queries.ts` | Better naming |
| `lib/db/sequence-generator.ts` | `_lib/database/sequence-generator.ts` | Keep together |
| `lib/db/fetch-helpers.ts` | `_lib/database/fetch-helpers.ts` | Keep together |
| `lib/type-guards.ts` | `_lib/database/type-guards.ts` | Used with queries |
| `lib/emails/` → | `_lib/email/` | Singular, cleaner |
| `lib/calendar-token.ts` | `_lib/helpers/calendar-helpers.ts` | Group calendar utils |
| `lib/calendar-audit.ts` | `_lib/helpers/calendar-helpers.ts` | Merge related |
| `lib/invoice-helpers.ts` | `_lib/helpers/invoice-helpers.ts` | Keep helpers together |
| `lib/form-utils.ts` | `_lib/helpers/form-utils.ts` | Helper functions |
| `lib/utils.ts` | `_lib/utils/format.ts` | Split by concern |
| `lib/constante.ts` | `_lib/utils/constants.ts` | Better naming |
| `lib/requireAuth.ts` | `_lib/utils/auth.ts` | Better naming |

#### **Step 1.3: Keep existing (already well-organized)**
- ✅ `lib/api/` - Already perfect
- ✅ `lib/actions/` - Keep as-is
- ✅ `lib/hooks/` - Keep as-is
- ✅ `lib/schemas/` - Keep as-is
- ✅ `lib/session/` - Keep as-is
- ✅ `lib/types/` - Keep as-is

---

### **Phase 2: Reorganize Components** 🎨

#### **Step 2.1: Rename `app/components/` → `app/_components/`**
- Prefix with `_` to indicate it's not a route
- Better Next.js convention

#### **Step 2.2: Keep existing structure (already good)**
```
app/_components/
├── ui/              # ✅ Already good
├── forms/           # ✅ Already good
├── layout/          # ✅ Already good
├── features/        # ✅ Already good
├── invoices/        # ✅ Already good
├── clients/         # ✅ Already good
└── shared/          # ✅ Already good
```

#### **Step 2.3: Colocation for route-specific components**
For components used by ONLY one route, move to route folder:
```
app/[lang]/(app)/invoices/
├── page.tsx
├── new/
│   └── page.tsx
├── _components/           # NEW - Route-specific
│   ├── invoice-table.tsx
│   └── invoice-filters.tsx
└── _hooks/               # NEW - Route-specific
    └── use-invoice-list.ts
```

---

### **Phase 3: Reorganize Context** 🔌

#### **Rename `app/context/` → `app/_context/`**
| Old File | New File | Reason |
|----------|----------|--------|
| `ReactQueryWrapper.tsx` | `query-provider.tsx` | Better naming |
| `UserContext.tsx` | `user-provider.tsx` | Consistent naming |
| `langageContext.tsx` | `language-provider.tsx` | Fix typo + consistent |
| `SidebarContext.tsx` | `sidebar-provider.tsx` | Consistent naming |
| `FormContext.tsx` | `form-provider.tsx` | Consistent naming |
| `HourlyRateFormContext.tsx` | `hourly-rate-form-provider.tsx` | Consistent naming |

---

### **Phase 4: Clean Up Old Files** 🧹

#### **Delete obsolete files:**
```bash
rm -rf app/_old_routes/
rm -rf app/css/              # Move to globals.css or components
rm app/page.txt              # Unused
rm API_ANALYSIS.md           # Archive or move to docs/
rm LIB_ANALYSIS.md           # Archive or move to docs/
```

#### **Move documentation:**
```bash
mkdir docs/
mv API_ANALYSIS.md docs/
mv LIB_ANALYSIS.md docs/
mv NEXTJS_OPTIMIZATION_REPORT.md docs/
mv app/components/README.md docs/component-structure.md
mv app/components/SIMPLIFICATION_SUMMARY.md docs/
```

---

### **Phase 5: Update Imports** 🔄

#### **Create path aliases in `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./app/_components/*"],
      "@/lib/*": ["./app/_lib/*"],
      "@/context/*": ["./app/_context/*"],
      "@/types/*": ["./app/_lib/types/*"],
      "@/hooks/*": ["./app/_lib/hooks/*"],
      "@/api/*": ["./app/_lib/api/*"],
      "@/db/*": ["./app/_lib/database/*"],
      "@/utils/*": ["./app/_lib/utils/*"]
    }
  }
}
```

#### **Global find & replace:**
```bash
# Update imports after moving files
from: "@/lib/"
to: "@/lib/"

from: "@/components/"
to: "@/components/"

from: "@/context/"
to: "@/context/"
```

---

## 📁 Final Optimized Structure

```
app/
├── (auth)/                    # Auth routes
├── (marketing)/               # Public routes
├── [lang]/(app)/              # Main app
├── api/                       # API routes (optimized)
├── _components/               # Shared components
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   ├── features/
│   ├── invoices/
│   ├── clients/
│   └── shared/
├── _lib/                      # Shared utilities
│   ├── actions/
│   ├── api/
│   ├── database/
│   ├── email/
│   ├── helpers/
│   ├── hooks/
│   ├── schemas/
│   ├── session/
│   ├── types/
│   └── utils/
├── _context/                  # React providers
├── layout.tsx
├── page.tsx
├── not-found.tsx
└── globals.css
```

---

## ✅ Benefits

### **Developer Experience:**
- 🎯 Clear separation of concerns
- 📦 Easy to find files
- 🔍 Better IDE autocomplete
- 📚 Self-documenting structure

### **Performance:**
- ⚡ Better code splitting
- 🚀 Faster route resolution
- 💾 Improved caching
- 🔄 Optimal revalidation

### **Maintainability:**
- 🧹 Clean imports
- 🔒 Type-safe paths
- 📖 Easy onboarding
- 🛠️ Scalable architecture

---

## 🚀 Execution Order

1. **Phase 1**: Reorganize lib (database, email, utils)
2. **Phase 2**: Rename components folder
3. **Phase 3**: Rename context folder
4. **Phase 4**: Clean up old files
5. **Phase 5**: Update all imports
6. **Phase 6**: Test build
7. **Phase 7**: Update documentation

---

## ⚠️ Breaking Changes: ZERO

All changes are internal file organization. No API contracts or component interfaces change.

---

## 📊 Impact

- **Files to move**: ~50 files
- **Imports to update**: ~200 locations
- **Estimated time**: 30-45 minutes
- **Build time impact**: None (same code, better organized)
- **Bundle size impact**: None (same code)
