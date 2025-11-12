# Next.js Optimization Report
**Generated:** November 12, 2025  
**Project:** FactureMe Website  
**Next.js Version:** 15.5.3

## Executive Summary

This report identifies 10 major areas where the FactureMe website could better utilize Next.js features for improved performance, developer experience, and maintainability.

**Priority Levels:**
- 🔴 **High Priority** - Significant performance/security impact
- 🟡 **Medium Priority** - Moderate improvement
- 🟢 **Low Priority** - Nice to have

---

## 1. 🔴 Replace Manual ETag Caching with Next.js Revalidation

### Current Implementation
Multiple API routes (`items-archives`, `hourlyRates`, `ticket`, `adminAcceuil`) implement custom ETag caching:

```typescript
// Current approach in /api/items-archives/route.ts
const clientEtag = req.headers.get("if-none-match");
const lastFactureDate = factures?.[totalFactures - 1]?.dateFacture?.toISOString();
if (clientEtag === lastFactureDate) {
  return new NextResponse(null, { status: 304 });
}
response.headers.set("Etag", lastFactureDate);
```

### Problems
- Manual cache invalidation logic scattered across codebase
- ETags managed in refs on client side (`etagRef.current`)
- No automatic cache purging when data changes
- Difficult to debug caching issues
- React Query polling every 5-10 seconds even with caching

### Recommended Solution
Use Next.js built-in caching with tags:

```typescript
// In data fetching functions (lib/data.ts)
import { unstable_cache } from 'next/cache'

export const getAllFacturesUsers = unstable_cache(
  async (userId: number) => {
    // ... existing query logic
  },
  ['invoices'], // cache tag
  { tags: ['invoices'], revalidate: 3600 } // 1 hour
)

// In mutation endpoints (when invoice is created/updated)
import { revalidateTag } from 'next/cache'

export async function createInvoice(data) {
  // ... create invoice
  revalidateTag('invoices') // Automatically invalidate cache
  return result
}
```

### Benefits
- ✅ Automatic cache invalidation
- ✅ No client-side ETag management
- ✅ Reduces React Query complexity
- ✅ Better performance with persistent cache
- ✅ Centralized cache management

### Files to Modify
- `app/api/items-archives/route.ts`
- `app/api/hourlyRates/route.ts`
- `app/api/ticket/route.ts`
- `app/api/client/clients/route.ts`
- `app/lib/data.ts` (add `unstable_cache` wrappers)
- Client components (remove `etagRef` logic)

---

## 2. 🔴 Convert Client Components to Server Components

### Current Implementation
Many pages fetch data client-side with `useState`/`useEffect`:

```typescript
// app/clients-catalogue/page.tsx
"use client"
export default function ItemCatalogue() {
  const [clients, setClients] = useState<ClientAffichage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/clients-catalogue", { cache: "no-cache" });
    const data = await res.json();
    setClients(data.clients);
    setLoading(false);
  };
  // ...
}
```

### Problems
- Waterfalls: Component renders → useEffect runs → fetch starts
- Loading states managed manually
- No SSR (Flash of loading state on every page load)
- SEO: Content not in initial HTML
- More JavaScript sent to client

### Recommended Solution
Convert to Server Component with async/await:

```typescript
// app/clients-catalogue/page.tsx (NO "use client")
import { fetchClientByUserId } from '@/app/lib/data'
import { getUserFromCookies } from '@/app/lib/session/session-node'
import ClientCatalogueClient from './client' // For interactive parts only

export default async function ClientCataloguePage() {
  const user = await getUserFromCookies()
  const result = await fetchClientByUserId(user?.idUser ?? -1)
  
  return <ClientCatalogueClient clients={result.clients} />
}
```

```typescript
// app/clients-catalogue/client.tsx
"use client"
export default function ClientCatalogueClient({ clients }: { clients: ClientAffichage[] }) {
  // Interactive features only (search, filter, etc.)
}
```

### Benefits
- ✅ Faster initial page load (data fetched during SSR)
- ✅ Better SEO (content in HTML)
- ✅ Automatic loading states with Suspense
- ✅ Less client JavaScript
- ✅ Parallel data fetching with layout

### Files to Convert
**High Priority:**
- `app/clients-catalogue/page.tsx`
- `app/hourlyRates/page.tsx`
- `app/item/item-catalogue/page.tsx`
- `app/item/items-archives/page.tsx`
- `app/homePage/page.tsx` (partial - keep interactivity client-side)

**Medium Priority:**
- `app/item/historique-factures/page.tsx`
- `components/ui/table.tsx` (extract data fetching)

---

## 3. 🟡 Replace `router.push()` with `<Link>` Components

### Current Implementation
```typescript
// components/ui/table.tsx
<button onClick={() => router.push("/previsualisation")}>
  View
</button>

// app/invoices/create/page.tsx
useEffect(() => {
  if (ready && !user) {
    router.push("/auth/signup");
  }
}, [user, ready, router]);
```

### Problems
- No prefetching (Link prefetches on hover/viewport)
- No Suspense-aware transitions
- Harder to style with hover states
- Accessibility issues (buttons aren't links)

### Recommended Solution
```typescript
// Use Link for navigation
<Link 
  href="/previsualisation"
  prefetch={true} // or false for auth-required pages
  className="button-styles"
>
  View
</Link>

// Keep router.push only for programmatic navigation after actions
async function handleSubmit() {
  await createInvoice(data)
  router.push('/invoices') // ✅ Correct usage
}
```

### Benefits
- ✅ Automatic prefetching
- ✅ Better accessibility
- ✅ Faster navigation
- ✅ Browser history works correctly

### Files to Check
- `components/ui/table.tsx` - Multiple router.push calls
- `app/page.tsx` - Auth redirect
- `app/invoices/create/page.tsx` - Auth redirect
- Search for pattern: `onClick={() => router.push`

---

## 4. 🟡 Add Dynamic Route Optimization

### Current Implementation
Routes like `/item/detail/[encodedId]` are always dynamically rendered.

### Opportunity
If certain items are frequently accessed (e.g., popular products), they could be pre-generated:

```typescript
// app/item/detail/[id]/page.tsx
export async function generateStaticParams() {
  const popularItems = await getPopularItems() // Top 20 items
  return popularItems.map((item) => ({
    id: String(item.idObjet),
  }))
}

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  // This page will be static for popular items, dynamic for others
  const item = await getOneItem(parseInt(params.id))
  // ...
}
```

### Benefits
- ✅ Instant load for popular items
- ✅ Reduced database queries
- ✅ Falls back to dynamic for others

### Decision Needed
⚠️ **Analysis required**: Check analytics to see if this pattern applies. May not be worth it if all items accessed equally.

---

## 5. 🟡 Optimize Image Components

### Current Issue
`next.config.ts` has `images: { unoptimized: true }` - disables all Next.js image optimization!

```typescript
// next.config.ts
images: {
  unoptimized: true, // ❌ BAD: Disables all optimization
  remotePatterns: [...]
}
```

### Recommended Fix
1. **Enable optimization:**
```typescript
images: {
  unoptimized: false, // Enable optimization
  remotePatterns: [...]
}
```

2. **Add proper sizing to all Images:**
```typescript
// ❌ Before
<Image src="/logo.png" alt="Logo" />

// ✅ After
<Image 
  src="/logo.png" 
  alt="Logo"
  width={200}
  height={50}
  priority // for above-the-fold images
/>

// ✅ Or for responsive
<Image 
  src="/logo.png" 
  alt="Logo"
  fill
  className="object-contain"
/>
```

### Files to Check
- `app/components/Header.tsx`
- `app/components/Sidebar.tsx`
- `app/components/comments.tsx`
- `app/homePage/page.tsx`
- `app/previsualisation/page.tsx`
- All components with `<Image>` tag

### Benefits
- ✅ Automatic WebP/AVIF conversion
- ✅ Responsive image sizing
- ✅ Lazy loading
- ✅ Blur placeholders
- **Potential: 50-70% smaller image sizes**

---

## 6. 🔴 Expand Server Actions for Forms

### Current Implementation
Forms submit to API routes then fetch on client:

```typescript
// Client component
const handleSubmit = async (data) => {
  const res = await fetch('/api/clients-catalogue', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (res.ok) {
    // manually refresh or navigate
  }
}
```

### Already Implemented (Good!)
`lib/actions/clients-actions.ts` has proper server actions:
```typescript
'use server'
export async function createClient(formData: ClientForm) {
  // ... validation and DB work
  revalidatePath('/clients-catalogue') // ✅ Auto cache invalidation
  redirect('/clients-catalogue') // ✅ Auto navigation
}
```

### Recommendation
Expand this pattern to:
- Hourly rate creation/editing
- Item creation/editing
- Invoice operations
- Profile updates

### Benefits
- ✅ Type-safe
- ✅ No separate API endpoint needed
- ✅ Automatic revalidation
- ✅ Progressive enhancement
- ✅ Better error handling

---

## 7. 🟡 Add Metadata to All Pages

### Current State
Only 2 files have metadata:
- `app/layout.tsx` (root metadata)
- `app/auth/email/check-email/page.tsx`

### Missing Metadata
**Every page should have:**
```typescript
// app/homePage/page.tsx
export const metadata = {
  title: 'Accueil - FactureMe',
  description: 'Gérez vos factures facilement avec FactureMe',
}

// Or dynamic:
export async function generateMetadata({ params }) {
  const item = await getOneItem(params.id)
  return {
    title: `${item.itemNom} - FactureMe`,
    description: item.description,
  }
}
```

### Pages Needing Metadata
- `app/homePage/page.tsx`
- `app/clients-catalogue/page.tsx`
- `app/hourlyRates/page.tsx`
- `app/invoices/page.tsx`
- `app/item/item-catalogue/page.tsx`
- `app/calendar/page.tsx`
- `app/profile/page.tsx`
- `app/about/page.tsx`

### Benefits
- ✅ Better SEO
- ✅ Social media previews
- ✅ Browser tab titles
- ✅ Accessibility

---

## 8. 🟢 Use Next.js `headers()` and `cookies()` Utilities

### Current Implementation
```typescript
// app/api/clients-catalogue/route.ts
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const session = token ? await decrypt(token) : null
  // ...
}
```

### Recommended (More type-safe)
```typescript
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = token ? await decrypt(token) : null
  // ...
}
```

### Benefits
- ✅ Better TypeScript support
- ✅ More consistent API
- ✅ Easier mocking in tests
- ✅ Future-proof (recommended approach)

### Scope
~30 API route files to update

---

## 9. 🟡 Add Loading & Error Files

### Current State
No `loading.tsx` or `error.tsx` files in route segments.

### Recommendation
Add to key routes:

```typescript
// app/homePage/loading.tsx
export default function Loading() {
  return <div className="...">
    <Skeleton /> {/* Branded loading UI */}
  </div>
}

// app/homePage/error.tsx
'use client'
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return <div>
    <h2>Une erreur s'est produite</h2>
    <button onClick={reset}>Réessayer</button>
  </div>
}
```

### Key Routes
- `app/homePage/`
- `app/clients-catalogue/`
- `app/hourlyRates/`
- `app/invoices/`
- `app/item/item-catalogue/`

### Benefits
- ✅ Automatic loading UI with Suspense
- ✅ Error boundaries without extra code
- ✅ Better UX
- ✅ Consistent error handling

---

## 10. 🔴 Review next.config.ts

### Current Config Issues

```typescript
const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // ❌ Disables optimization
  },
  eslint: { ignoreDuringBuilds: true }, // ⚠️ Dangerous
  // Missing: output, compress, reactStrictMode, etc.
}
```

### Recommended Config
```typescript
const nextConfig: NextConfig = {
  images: {
    unoptimized: false, // ✅ Enable optimization
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
    ],
  },
  eslint: { 
    ignoreDuringBuilds: false, // ✅ Catch issues early
  },
  compress: true, // ✅ Enable gzip
  reactStrictMode: true, // ✅ Catch bugs
  poweredByHeader: false, // ✅ Security
  
  // For deployment:
  output: 'standalone', // ✅ Smaller Docker images
}
```

### Benefits
- ✅ Better performance
- ✅ Smaller builds
- ✅ Catches errors earlier
- ✅ Security improvements

---

## Priority Implementation Plan

### Phase 1 (Week 1-2) - High Impact 🔴
1. **Fix image optimization** - Enable in config, audit all Image components
2. **Convert caching to revalidateTag** - Replace ETag logic in 4-5 API routes
3. **Expand Server Actions** - Convert 3-4 key form submissions

### Phase 2 (Week 3-4) - Major Refactor 🔴
4. **Convert pages to Server Components** - Start with clients-catalogue, hourlyRates
5. **Add metadata to all pages** - SEO improvement

### Phase 3 (Week 5+) - Polish 🟡🟢
6. **Replace router.push with Link** - Better navigation
7. **Add loading.tsx and error.tsx** - Better UX
8. **Migrate to headers()/cookies()** - Code consistency
9. **Evaluate generateStaticParams** - If analytics support it
10. **Review and optimize config** - Final polish

---

## Estimated Impact

**Performance:**
- ~30-40% faster initial page loads (Server Components + Image optimization)
- ~50% reduction in client JS (moving logic server-side)
- ~60% smaller images (enabling optimization)

**Developer Experience:**
- Simpler caching logic (revalidateTag vs manual ETags)
- Type-safe forms (Server Actions)
- Auto-refresh on mutations (no manual refetch)

**SEO:**
- Content in initial HTML (Server Components)
- Proper meta tags (metadata)

**Maintainability:**
- Centralized cache invalidation
- Fewer client state management
- Built-in error boundaries

---

## Breaking Changes to Consider

⚠️ **Converting to Server Components requires:**
1. Splitting interactive parts into separate client components
2. Moving context providers
3. Handling search params differently
4. No access to browser APIs in server components

⚠️ **Cache tag system requires:**
1. Consistent tagging strategy
2. Documentation for when to invalidate
3. Testing cache behavior

---

## Questions for Team

1. **Image optimization**: Why was it disabled? Any specific issues?
2. **Static generation**: Do we have analytics on which invoices/items are accessed most?
3. **Breaking changes**: Preferred timeline for major refactors?
4. **Deployment**: Are we using Docker? (affects `output` config)

---

## Next Steps

1. Review this report with team
2. Prioritize which changes to tackle first
3. Create detailed task breakdown for Phase 1
4. Set up feature branch for testing
5. Implement changes incrementally with thorough testing

---

**Generated by:** GitHub Copilot  
**Review Date:** November 12, 2025  
**Status:** Ready for Team Review
