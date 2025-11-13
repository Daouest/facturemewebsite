# UI Components & CSS Standardization

This directory contains reusable UI components that provide consistent styling across the FactureMe application.

## 🎨 Components

### Card

A flexible container component with glass-morphism effect.

**Variants:**
- `default` - Standard glass card with white/5 background
- `gradient` - Card with sky-to-indigo gradient
- `transparent` - Transparent background variant

**Padding Options:**
- `none` - No padding
- `sm` - Small padding (p-4)
- `md` - Medium padding (p-6) - default
- `lg` - Large padding (p-8)

**Examples:**
```tsx
import Card from "@/components/ui/Card";

// Basic usage
<Card>
  <h2>Title</h2>
  <p>Content here</p>
</Card>

// With variants
<Card variant="gradient" padding="lg">
  Featured content
</Card>

// Custom className
<Card className="hover:shadow-2xl">
  Interactive card
</Card>

// As different HTML element
<Card as="article">
  Article content
</Card>
```

**Helper Components:**
```tsx
import { CardLoading, CardError } from "@/components/ui/Card";

// Loading state
<CardLoading message="Fetching data..." />

// Error state
<CardError message="Failed to load content" />
```

---

### Section

A sectioned container for form fields and grouped content.

**Props:**
- `title` - Section heading text
- `icon` - React node for icon display
- `iconBgColor` - Tailwind classes for icon background (default: sky theme)
- `className` - Additional CSS classes
- `as` - HTML element type (default: 'section')

**Examples:**
```tsx
import Section from "@/components/ui/Section";

// With title and icon
<Section 
  title="Customer Information"
  icon={<UserIcon className="w-4 h-4 text-sky-300" />}
>
  <CustomerSelect />
</Section>

// With custom icon colors
<Section
  title="Business Details"
  icon={<BuildingIcon />}
  iconBgColor="bg-emerald-500/20 ring-emerald-400/30"
>
  <BusinessSelect />
</Section>

// Simple section without header
<Section>
  <p>Content without title</p>
</Section>
```

---

### PageContainer

Provides consistent page layout with optional decorative effects.

**Props:**
- `children` - Page content
- `className` - Additional CSS classes
- `withGlows` - Enable/disable decorative glows (default: true)
- `maxWidth` - Container max width: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'

**Examples:**
```tsx
import PageContainer from "@/components/ui/PageContainer";
import { PageWrapper } from "@/components/ui/PageContainer";

// Standard page with glows
<PageContainer>
  <Card>Your content</Card>
</PageContainer>

// Narrower content area
<PageContainer maxWidth="lg" withGlows={false}>
  <Card>Centered, narrower content</Card>
</PageContainer>

// Full page wrapper with gradient background
<PageWrapper>
  <Header />
  <PageContainer>
    <Card>Page content</Card>
  </PageContainer>
</PageWrapper>
```

---

## 🎨 CSS Utility Classes

Added to `globals.css` for consistent styling patterns.

### Glass Effects

```css
.glass-card
/* Standard glass card with backdrop blur */

.glass-card-gradient
/* Glass card with gradient background */

.section-container
/* Form section styling */
```

**Usage:**
```tsx
<div className="glass-card p-6">
  Content with glass effect
</div>
```

### Icon Badges

```css
.icon-badge          /* Base badge style */
.icon-badge-sky      /* Sky blue theme */
.icon-badge-emerald  /* Emerald green theme */
.icon-badge-violet   /* Violet purple theme */
.icon-badge-amber    /* Amber orange theme */
```

**Usage:**
```tsx
<span className="icon-badge icon-badge-sky">
  <UserIcon className="w-4 h-4 text-sky-300" />
</span>
```

### Layout & Background

```css
.page-bg          /* Standard page gradient background */
.glow-effects     /* Container for decorative glows */
```

### Typography

```css
.heading-page     /* Page-level heading (3xl) */
.heading-section  /* Section heading (xl) */
.text-muted       /* Muted text color */
```

**Usage:**
```tsx
<h1 className="heading-page">Dashboard</h1>
<h2 className="heading-section">Recent Invoices</h2>
<p className="text-muted">Last updated 2 hours ago</p>
```

### Buttons

```css
.btn-primary   /* Primary action button (sky blue) */
.btn-outline   /* Outlined secondary button */
```

**Usage:**
```tsx
<button className="btn-primary">
  Create Invoice
</button>

<button className="btn-outline">
  Cancel
</button>
```

### Interactive Cards

```css
.card-interactive
/* Card with hover effects - lifts and changes border color */
```

**Usage:**
```tsx
<Link href="/invoice/123" className="card-interactive block p-6">
  <h3>Invoice #123</h3>
  <p>Click to view</p>
</Link>
```

---

## 🔄 Migration Guide

### Before (Manual Classes)
```tsx
<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
  <h3 className="text-xl font-semibold text-slate-100 mb-4">
    Title
  </h3>
  <p className="text-slate-300/80">Content</p>
</div>
```

### After (Component-Based)
```tsx
<Card>
  <h3 className="heading-section mb-4">
    Title
  </h3>
  <p className="text-muted">Content</p>
</Card>
```

### Before (Form Sections)
```tsx
<section className="rounded-xl ring-1 ring-white/10 bg-white/0 p-4">
  <div className="mb-3 flex items-center gap-2">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 ring-1 ring-sky-400/30">
      <UserIcon className="h-4 w-4 text-sky-300" />
    </span>
    <h2 className="text-sm font-semibold text-slate-200">
      Customer
    </h2>
  </div>
  <CustomerSelect />
</section>
```

### After (Section Component)
```tsx
<Section 
  title="Customer"
  icon={<UserIcon className="h-4 w-4 text-sky-300" />}
>
  <CustomerSelect />
</Section>
```

---

## 📊 Coverage

**Current Usage:** 40+ files across the application

**Components replaced:**
- Card components: 20+ instances
- Form sections: 7+ instances
- Page containers: Multiple layouts

**Files updated:**
- ✅ `app/[lang]/(app)/dashboard/page.tsx`
- ✅ `app/ui/invoices/InvoiceCreationForm.tsx`
- ✅ `app/components/ui/Card.tsx` (new)
- ✅ `app/components/ui/Section.tsx` (new)
- ✅ `app/components/ui/PageContainer.tsx` (new)
- ✅ `app/globals.css` (utility classes added)

**Remaining files to migrate:** ~38 files with glass card pattern

---

## 🎯 Benefits

1. **Consistency** - Unified styling across all pages
2. **Maintainability** - Change styles in one place
3. **Bundle Size** - Reduced CSS duplication
4. **Developer Experience** - Simpler, more readable code
5. **Type Safety** - TypeScript props for better IDE support
6. **Accessibility** - Semantic HTML options (as prop)

---

## 🔧 Utilities Location

All utility classes are defined in:
```
app/globals.css
```

Look for the `@layer utilities` section for the complete list.

---

## 📝 Notes

- All components use `cn()` utility from `@/lib/utils` for className merging
- Components support custom className props for flexibility
- Semantic HTML can be specified via `as` prop
- All styles maintain dark theme consistency
- Backdrop blur effects require browser support

---

## 🚀 Next Steps

To complete the standardization:

1. Migrate remaining pages to use Card component
2. Update form components to use Section
3. Consider extracting button components
4. Add more icon badge color variants as needed
5. Document color palette in design system
