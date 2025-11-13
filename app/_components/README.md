# Component Organization

This directory contains all React components organized by their purpose and usage patterns.

## 📁 Folder Structure

```
components/
├── layout/          # Layout & navigation components
├── forms/           # Form components for data entry
├── features/        # Feature-specific components
├── shared/          # Reusable shared components
└── ui/              # Base UI components (design system)
```

## 📐 Layout Components (`layout/`)

Components that define the application structure and navigation.

- **`Header.tsx`** - Top navigation bar with user menu and language selector
- **`Footer.tsx`** - Application footer
- **`Sidebar.tsx`** - Main navigation sidebar
- **`MobileSidebarWrapper.tsx`** - Mobile-responsive sidebar wrapper

**Usage:**
```tsx
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
```

---

## 📝 Form Components (`forms/`)

Form components for creating and editing data across the application.

- **`AuthForm.tsx`** - Authentication form (login/signup)
- **`FormCreationHourlyRate.tsx`** - Create new hourly rates
- **`formCreationItem.tsx`** - Create new products/items
- **`formDetailItem.tsx`** - View/edit product details
- **`formDetailsHourlyRate.tsx`** - View/edit hourly rate details

**Usage:**
```tsx
import { AuthForm } from '@/components/forms/AuthForm';
import { FormCreationHourlyRate } from '@/components/forms/FormCreationHourlyRate';
```

---

## 🎯 Feature Components (`features/`)

Components specific to particular features or pages of the application.

- **`lastFactures.tsx`** - Recent invoices list widget
- **`stats.tsx`** - Dashboard statistics display
- **`adminAcceuil.tsx`** - Admin dashboard welcome component
- **`comments.tsx`** - Comments/notes component
- **`ActionsCard.tsx`** - Quick action cards
- **`Ticket.tsx`** - Support ticket component

**Usage:**
```tsx
import { LastFactures } from '@/components/features/lastFactures';
import { Stats } from '@/components/features/stats';
```

---

## 🔄 Shared Components (`shared/`)

Reusable components used across multiple features.

### Form Components
- **`FormInput.tsx`** - Unified input component with stacked/horizontal layouts (merges Input + InputField)
- **`Select.tsx`** - Generic select dropdown with icon support and error handling
- **`FormAlert.tsx`** - Standardized alert component for forms (success/error messages)
- **`Button.tsx`** - Custom button component with variants
- **`AddressAutocomplete.tsx`** - Address autocomplete input

### Legacy Components (Deprecated - use FormInput instead)
- **`Input.tsx`** - ⚠️ Use FormInput instead
- **`InputField.tsx`** - ⚠️ Use FormInput instead

### Typography
- **`TextType.tsx`** - Typography component

**Usage:**
```tsx
import FormInput from '@/components/shared/FormInput';
import Select from '@/components/shared/Select';
import FormAlert from '@/components/shared/FormAlert';
import { Button } from '@/components/shared/Button';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete';

// FormInput - Stacked layout (default)
<FormInput 
  label="Email" 
  name="email" 
  type="email" 
  error={errors.email}
/>

// FormInput - Horizontal layout
<FormInput 
  label="Name" 
  name="name" 
  layout="horizontal" 
  labelWidth="sm:w-1/4"
/>

// Select with icon
<Select
  id="customer"
  name="customerId"
  value={selectedId}
  onChange={setSelectedId}
  options={customers}
  placeholder="Select a customer"
  icon={<UserIcon />}
  error={errors.customerId}
/>

// FormAlert
<FormAlert
  show={showAlert}
  type="success"
  message="Data saved successfully!"
  title="Success"
  onClose={() => setShowAlert(false)}
/>
```

---

## 🎨 UI Components (`ui/`)

Base design system components with consistent styling.

- **`Card.tsx`** - Glass-morphism card with variants
- **`Section.tsx`** - Form section wrapper
- **`PageContainer.tsx`** - Page layout wrapper
- **`PageTemplate.tsx`** - Reference template for new pages

See [ui/README.md](./ui/README.md) for detailed documentation.

**Usage:**
```tsx
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { PageContainer } from '@/components/ui/PageContainer';
```

---

## 🗂️ Additional Component Locations

### Invoice Components (`app/ui/invoices/`)

Specialized components for invoice creation and management:
- `InvoiceCreationForm.tsx`
- `InvoiceDateSelector.tsx`
- `InvoiceNumberSection.tsx`
- `CustomerSelect.tsx`
- `BusinessSelect.tsx`
- `HourlyRatesSection.tsx`
- `ProductsSection.tsx`
- `InvoiceSummary.tsx`
- `InvoiceTypeSelector.tsx`
- `ValidationWarning.tsx`
- `ItemsList.tsx`
- `pdf-invoice.tsx`

### Client Components (`app/ui/clients-catalogue/`)

- `create-form.tsx` - Client creation form

### Shadcn UI Components (`components/ui/`)

Third-party UI library components:
- `alert.tsx`
- `badge.tsx`
- `button.tsx`
- `images.tsx`
- `switch.tsx`
- `table.tsx`

---

## 📋 Import Path Conventions

### Recommended Import Patterns

```tsx
---

## 🛠️ Utility Functions

### Form Utilities (`@/lib/form-utils`)

Shared utilities for common form operations:

```tsx
import {
  formatPrice,
  parsePrice,
  handleImageUpload,
  createErrorState,
  type ErrorState,
} from '@/lib/helpers/form-utils';

// Price formatting for display
const displayPrice = formatPrice("1234.56"); // "1 234,56"

// Parse formatted price back to number
const numericPrice = parsePrice("1 234,56"); // 1234.56

// Handle image upload with base64 conversion
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const { fileUrl, imageBase64 } = await handleImageUpload(file);
    setFormData({ ...formData, image: imageBase64 });
  }
};

// Error state management
const [error, setError] = useState<ErrorState>(createErrorState());
setError({ error: true, message: "Invalid input" });
```

**Available utilities:**
- `formatPrice(value: string): string` - Format numeric input for French Canadian locale
- `parsePrice(formatted: string): number` - Parse formatted price to number
- `handleImageUpload(file: File): Promise<{fileUrl, imageBase64}>` - Upload and convert image
- `createErrorState(): ErrorState` - Initialize error state
- `ErrorState` type - Standard error state structure

---

## 📚 Import Examples

```tsx
// Layout components
import { Header } from '@/components/layout/Header';

// Form components
import { AuthForm } from '@/components/forms/AuthForm';

// Feature components
import { LastFactures } from '@/components/features/lastFactures';

// Shared components
import { Button } from '@/components/shared/Button';

// UI design system
import { Card } from '@/components/ui/Card';

// Invoice-specific
import { InvoiceCreationForm } from '@/components/invoices/InvoiceCreationForm';

// Client-specific
import { CreateForm } from '@/components/clients/create-form';
```

---

## 🎯 Component Selection Guide

**When creating a new component, place it in:**

| Type | Folder | Example |
|------|--------|---------|
| Navigation, header, footer, sidebar | `layout/` | Navigation menus |
| Form for data entry/editing | `forms/` | Create client form |
| Feature-specific functionality | `features/` | Dashboard widgets |
| Reusable across features | `shared/` | Custom inputs |
| Design system base components | `ui/` | Cards, sections |
| Invoice-specific | `invoices/` | Invoice fields, PDF generation |
| Client management | `clients/` | Client forms |

---

## 🔄 Migration Notes

Components were reorganized on November 13, 2025 for better maintainability. 

**Before:**
```
components/
├── Header.tsx
├── Footer.tsx
├── FormCreationItem.tsx
├── lastFactures.tsx
└── ... (all mixed together)
```

**After:**
```
components/
├── layout/
├── forms/
├── features/
├── shared/
└── ui/
```

**Breaking Changes:** Update import paths when using these components.

---

## 📚 Additional Resources

- [UI Components Documentation](./ui/README.md)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 🤝 Contributing

When adding new components:

1. ✅ Choose the appropriate folder based on the guide above
2. ✅ Use consistent naming (PascalCase for components)
3. ✅ Export components as named exports
4. ✅ Add TypeScript types for props
5. ✅ Document complex components
6. ✅ Update this README if adding new categories

---

**Last Updated:** November 13, 2025
