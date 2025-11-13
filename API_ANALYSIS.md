# API Refactoring Analysis

## Overview
- **Total API Routes**: 44 unique routes across 17 directories
- **Analysis Date**: Current session
- **Objective**: Identify and eliminate duplication patterns, standardize error handling, improve code reusability

---

## PATTERN 1: Duplicate Try-Catch Error Handling ⚠️ HIGH PRIORITY
**Impact**: ~440 lines (10 lines × 44 routes)
**Locations**: ALL route files
**Problem**: Every route has identical try-catch with console.error + NextResponse.json

### Current Pattern (Repeated 44 times):
```typescript
try {
  // route logic
} catch (error) {
  console.error("Erreur dans [METHOD] /api/[route] :", error);
  return NextResponse.json({ error: "Impossible de..." }, { status: 500 });
}
```

### Files Affected:
- item/route.ts (3 handlers × 10 lines = 30 lines)
- hourlyRates/route.ts (4 handlers × 10 lines = 40 lines)
- ticket/route.ts (2 handlers × 10 lines = 20 lines)
- users/route.ts (1 handler × 10 lines = 10 lines)
- profile/route.ts (2 handlers × 30 lines = 60 lines)
- profile/business/route.ts (2 handlers × 30 lines = 60 lines)
- profile/address/route.ts (2 handlers × 30 lines = 60 lines)
- auth/signup/route.ts (1 handler × 40 lines = 40 lines)
- auth/login/route.ts (1 handler × 20 lines = 20 lines)
- set-facture/route.ts (1 handler × 20 lines = 20 lines)
- Plus 34 other routes...

### Solution:
Create `lib/api/error-handler.ts` with generic wrapper:
```typescript
export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>,
  errorMessage: string = "Server error"
): Promise<NextResponse<T>> {
  try {
    return await handler();
  } catch (error) {
    console.error(errorMessage, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
```

---

## PATTERN 2: Duplicate Auth Checks (getUserFromCookies) ⚠️ HIGH PRIORITY
**Impact**: ~220 lines (11 lines × 20 routes)
**Locations**: Most authenticated routes
**Problem**: Same auth validation logic repeated

### Current Pattern:
```typescript
export async function GET(req: NextRequest) {
  const userFromCookie = await getUserFromCookies();
  if (!userFromCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // ... rest of logic
}
```

### Files Affected:
- profile/route.ts (2 handlers = 22 lines)
- profile/business/route.ts (2 handlers = 22 lines)
- profile/address/route.ts (2 handlers = 22 lines)
- hourlyRates/route.ts (1 handler = 11 lines)
- Plus ~16 other authenticated routes

### Solution:
Create `lib/api/auth-middleware.ts`:
```typescript
export async function withAuth<T>(
  handler: (user: UserSession, req: NextRequest) => Promise<NextResponse<T>>,
  req: NextRequest
): Promise<NextResponse<T>> {
  const user = await getUserFromCookies();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return handler(user, req);
}
```

---

## PATTERN 3: Duplicate ETag Handling ⚠️ MEDIUM PRIORITY
**Impact**: ~120 lines (30 lines × 4 routes)
**Locations**: profile/route.ts, profile/business/route.ts, ticket/route.ts, users/route.ts

### Current Pattern in profile/route.ts:
```typescript
export async function GET(_req: NextRequest) {
  // ... fetch user
  const res = NextResponse.json(toPublic(u), { status: 200 });
  res.headers.set("ETag", `"${u.__v ?? 0}"`);
  return res;
}

export async function PUT(req: NextRequest) {
  const ifMatch = req.headers.get("if-match") || undefined
  if (!ifMatch) {
    return NextResponse.json({ message: "Erreur dans le etag" }, { status: 412 })
  }
  const objVersion = Number(ifMatch?.replace(/"/g, "").trim())
  if (!Number.isFinite(objVersion)) {
    return NextResponse.json({ message: "Invalid Etag" }, { status: 400 })
  }
  // ... update logic with version check
}
```

### Files Affected:
- profile/route.ts (GET + PUT = ~40 lines)
- profile/business/route.ts (GET only = ~5 lines, no PUT validation)
- ticket/route.ts (GET with different header: if-None-Match = ~10 lines)
- users/route.ts (GET with if-count-change = ~10 lines)

### Solution:
Create `lib/api/etag-helpers.ts`:
```typescript
export function getETagVersion(req: NextRequest): number | null {
  const ifMatch = req.headers.get("if-match");
  if (!ifMatch) return null;
  const version = Number(ifMatch.replace(/"/g, "").trim());
  return Number.isFinite(version) ? version : null;
}

export function setETagHeader(response: NextResponse, version: number): NextResponse {
  response.headers.set("ETag", `"${version}"`);
  return response;
}

export function checkETagRequired(req: NextRequest): NextResponse | null {
  const ifMatch = req.headers.get("if-match");
  if (!ifMatch) {
    return NextResponse.json({ message: "ETag required" }, { status: 412 });
  }
  const version = Number(ifMatch.replace(/"/g, "").trim());
  if (!Number.isFinite(version)) {
    return NextResponse.json({ message: "Invalid Etag" }, { status: 400 });
  }
  return null; // no error
}
```

---

## PATTERN 4: Duplicate Cache Control (304 Not Modified) ⚠️ MEDIUM PRIORITY
**Impact**: ~80 lines (20 lines × 4 routes)
**Locations**: hourlyRates/route.ts, ticket/route.ts, users/route.ts, histories-invoices/route.ts

### Current Pattern (3 variations):
```typescript
// Variation 1: Count-based (hourlyRates, users)
const arrayCount = totalRows.toString();
const clientCount = req.headers.get("if-count-change");
if (clientCount === arrayCount) {
  return new NextResponse(null, { status: 304 });
}
response.headers.set("Count", arrayCount);

// Variation 2: ETag with date (ticket)
const lastTicketDate = result.ticket?.[count - 1].date.toISOString();
const clientEtag = req.headers.get("if-None-Match");
if (clientEtag === lastTicketDate) {
  return new NextResponse(null, { status: 304 });
}
response.headers.set("Etag", lastTicketDate);

// Variation 3: ETag with count (histories-invoices)
const etagValue = `"${totalRows}-${lastModified}"`;
if (clientEtag === etagValue) {
  return new NextResponse(null, { status: 304 });
}
response.headers.set("ETag", etagValue);
```

### Files Affected:
- hourlyRates/route.ts (GET = ~15 lines)
- ticket/route.ts (GET = ~20 lines)
- users/route.ts (GET = ~15 lines)
- histories-invoices/route.ts (GET = ~20 lines)
- items-archives/route.ts (similar pattern = ~10 lines)

### Solution:
Create `lib/api/cache-helpers.ts`:
```typescript
export function checkCacheByCount(
  req: NextRequest,
  currentCount: number
): { shouldReturn304: boolean; count: string } {
  const count = currentCount.toString();
  const clientCount = req.headers.get("if-count-change");
  return {
    shouldReturn304: clientCount === count,
    count
  };
}

export function checkCacheByETag(
  req: NextRequest,
  etagValue: string
): boolean {
  const clientEtag = req.headers.get("if-None-Match");
  return clientEtag === etagValue;
}

export function setCacheHeaders(
  response: NextResponse,
  headers: { count?: string; etag?: string }
): NextResponse {
  if (headers.count) response.headers.set("Count", headers.count);
  if (headers.etag) response.headers.set("Etag", headers.etag);
  return response;
}
```

---

## PATTERN 5: Duplicate JSON Parsing & Validation ⚠️ MEDIUM PRIORITY
**Impact**: ~100 lines (10 lines × 10 routes)
**Locations**: Multiple POST/PUT routes
**Problem**: Same body parsing with error handling

### Current Pattern:
```typescript
// Pattern A: Basic parsing (no validation)
const body = await request.json();
body.prix = parseInt(body.prix); // manual type coercion

// Pattern B: With try-catch
let body: any;
try {
  body = await req.json()
} catch {
  return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
}

// Pattern C: With schema validation (auth/signup, auth/login)
const body = await req.json();
const parsed = SignupSchema.safeParse(body);
if (!parsed.success) {
  const errors: Record<string, string> = {}
  for (const err of parsed.error.issues) {
    const key = err.path.join(".")
    errors[key] = err.message
  }
  return NextResponse.json({ message: "Erreur dans la validation", errors }, { status: 400 })
}
```

### Files Affected:
- item/route.ts (POST, PUT, DELETE = 30 lines)
- hourlyRates/route.ts (POST, PUT, DELETE = 30 lines)
- profile/route.ts (PUT = 10 lines)
- profile/business/route.ts (PUT = 10 lines)
- profile/address/route.ts (PUT = 10 lines)
- auth/signup/route.ts (POST with validation = 15 lines)
- auth/login/route.ts (POST with validation = 10 lines)

### Solution:
Create `lib/api/request-helpers.ts`:
```typescript
export async function parseJSON<T>(
  req: Request,
  schema?: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
    };
  }

  if (schema) {
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const err of parsed.error.issues) {
        errors[err.path.join(".")] = err.message;
      }
      return {
        success: false,
        response: NextResponse.json({ message: "Validation error", errors }, { status: 400 })
      };
    }
    return { success: true, data: parsed.data };
  }

  return { success: true, data: body };
}
```

---

## PATTERN 6: Duplicate Database Connection ⚠️ LOW PRIORITY
**Impact**: ~44 lines (1 line × 44 routes, but important for consistency)
**Locations**: Almost all routes
**Problem**: Manual `await connectToDatabase()` in every route

### Current Pattern:
```typescript
export async function GET(req: NextRequest) {
  await connectToDatabase();
  // ... rest of logic
}
```

### Files Affected:
- auth/signup/route.ts
- auth/login/route.ts
- profile/route.ts
- profile/business/route.ts
- And many more...

### Solution:
This is already handled well with individual calls. Consider moving to middleware.ts if needed, but current approach is acceptable for now. **SKIP THIS PATTERN** - not worth the refactoring cost.

---

## PATTERN 7: Duplicate toPublic() Functions ⚠️ MEDIUM PRIORITY
**Impact**: ~60 lines (30 lines × 2 functions)
**Locations**: profile/route.ts, profile/business/route.ts
**Problem**: Similar data sanitization logic repeated

### Current Code:
```typescript
// profile/route.ts
function toPublic(u: any) {
  return {
    idUser: u.idUser,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    __v: u.__v,
  };
}

// profile/business/route.ts
function toPublic(bizz: any, address: any) {
  return {
    idBusiness: bizz.idBusiness,
    name: bizz.businessName,
    businessNumber: bizz.businessNumber,
    idAddress: bizz.idAddress,
    address: address.address,
    city: address.city,
    zipCode: address.zipCode,
    province: address.province,
    country: address.country,
    logo: bizz.businessLogo,
    TVP: bizz.TVPnumber,
    TVQ: bizz.TVQnumber,
    TVH: bizz.TVHnumber,
    TVS: bizz.TVSnumber
  };
}
```

### Solution:
Create `lib/api/response-formatters.ts`:
```typescript
export function formatUserPublic(u: any) {
  return {
    idUser: u.idUser,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    __v: u.__v,
  };
}

export function formatBusinessPublic(bizz: any, address: any) {
  return {
    idBusiness: bizz.idBusiness,
    name: bizz.businessName,
    businessNumber: bizz.businessNumber,
    idAddress: bizz.idAddress,
    address: address.address,
    city: address.city,
    zipCode: address.zipCode,
    province: address.province,
    country: address.country,
    logo: bizz.businessLogo,
    TVP: bizz.TVPnumber,
    TVQ: bizz.TVQnumber,
    TVH: bizz.TVHnumber,
    TVS: bizz.TVSnumber
  };
}
```

---

## PATTERN 8: Duplicate getUserInfoByEmail Pattern ⚠️ LOW PRIORITY
**Impact**: ~20 lines (10 lines × 2 routes)
**Locations**: item/route.ts (POST, PUT, DELETE)
**Problem**: Same user lookup pattern repeated 3 times in same file

### Current Code in item/route.ts:
```typescript
// Repeated in POST, PUT, DELETE
const userData = body.userData;
const itemData = body.formData;
const idUser = await getUserInfoByEmail(userData.email);
if (!userData.id) userData.id = idUser;
```

### Solution:
Extract to helper function or simplify by using getUserFromCookies() for authentication instead of passing userData in body. This is a security issue too - client shouldn't provide userData.

**RECOMMENDATION**: Refactor these routes to use proper authentication (getUserFromCookies) instead of passing user data in request body.

---

## PATTERN 9: Duplicate Mongoose Connection Logging ⚠️ CLEANUP
**Impact**: ~40 lines (10 lines × 4 routes)
**Locations**: auth/signup/route.ts, auth/login/route.ts
**Problem**: Debug logging for MongoDB connection repeated

### Current Code:
```typescript
console.log({
  mong: {
    uriHasFactureMe: process.env.MONGODB_URI?.includes("/FactureMe"),
    db: mongoose.connection.name,
    host: (mongoose.connection as any).host,
  }
})
```

### Solution:
Remove debug logging or move to a dedicated debug utility if needed. This appears to be leftover debug code.

---

## PATTERN 10: Duplicate Result Success Checks ⚠️ LOW PRIORITY
**Impact**: ~100 lines (5 lines × 20 routes)
**Locations**: Most routes that call data.ts functions
**Problem**: Same pattern for checking result.success

### Current Pattern:
```typescript
const result = await someDataFunction();
if (!result.success) {
  return NextResponse.json(result, { status: 500 });
}
return NextResponse.json(result, { status: 200 });
```

### Files Affected:
- item/route.ts (all handlers)
- hourlyRates/route.ts (all handlers)
- ticket/route.ts (all handlers)
- users/route.ts
- And more...

### Solution:
This is actually acceptable as-is. The data layer returns a consistent structure. Could be wrapped but adds complexity for minimal benefit. **SKIP THIS PATTERN**.

---

## Summary of Patterns

### High Priority (Implement First):
1. **Pattern 1**: Error handling wrapper (~440 lines saved)
2. **Pattern 2**: Auth middleware (~220 lines saved)

### Medium Priority (Implement Second):
3. **Pattern 3**: ETag helpers (~120 lines saved)
4. **Pattern 4**: Cache control helpers (~80 lines saved)
5. **Pattern 5**: JSON parsing & validation (~100 lines saved)
7. **Pattern 7**: Response formatters (~60 lines saved)

### Low Priority / Cleanup:
8. **Pattern 8**: Refactor item routes security (~20 lines, security fix)
9. **Pattern 9**: Remove debug logging (~40 lines cleanup)

### Skip:
6. **Pattern 6**: Database connection (already fine)
10. **Pattern 10**: Result success checks (acceptable as-is)

---

## Estimated Impact

### Lines Saved:
- **Phase 1 (High Priority)**: ~660 lines
- **Phase 2 (Medium Priority)**: ~360 lines
- **Phase 3 (Cleanup)**: ~60 lines
- **Total Estimated**: ~1080 lines saved

### Files to Create:
1. `lib/api/error-handler.ts` (20 lines)
2. `lib/api/auth-middleware.ts` (15 lines)
3. `lib/api/etag-helpers.ts` (40 lines)
4. `lib/api/cache-helpers.ts` (50 lines)
5. `lib/api/request-helpers.ts` (40 lines)
6. `lib/api/response-formatters.ts` (40 lines)
7. `lib/api/index.ts` (10 lines - re-exports)

**Total New Code**: ~215 lines
**Net Savings**: ~865 lines

---

## Implementation Plan

### Phase 1: Core Infrastructure (High Priority)
1. Create `lib/api/error-handler.ts` with withErrorHandling
2. Create `lib/api/auth-middleware.ts` with withAuth
3. Update 5-10 routes as proof of concept
4. Verify builds and test
5. Batch update remaining routes

### Phase 2: Request/Response Helpers (Medium Priority)
1. Create `lib/api/etag-helpers.ts`
2. Create `lib/api/cache-helpers.ts`
3. Create `lib/api/request-helpers.ts`
4. Create `lib/api/response-formatters.ts`
5. Update profile routes (they use all these patterns)
6. Update collection routes (ticket, users, hourlyRates)
7. Verify builds

### Phase 3: Cleanup & Security (Low Priority)
1. Remove debug logging from auth routes
2. Refactor item routes to use proper authentication
3. Final verification

### Phase 4: Documentation
1. Update API documentation
2. Document new helper functions
3. Calculate final metrics

---

## Breaking Changes Analysis
**Expected Breaking Changes**: ZERO

All changes are internal refactoring. API contracts (request/response) remain identical.

### Safety Measures:
- Keep original error messages
- Maintain exact status codes
- Preserve header names and formats
- Don't change response structures
- Test with existing frontend code

---

## Next Steps
1. Get approval from user
2. Create helper utilities (Phase 1)
3. Update routes in batches (5-10 at a time)
4. Run build after each batch
5. Proceed to Phase 2 once Phase 1 is stable

---

## Notes
- All patterns verified by reading actual route files
- Line counts are conservative estimates
- Build verification required after each phase
- Zero breaking changes expected for frontend
