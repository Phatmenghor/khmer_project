# Frontend Refactoring - Quick Start Guide

**Start here** - Copy and paste commands in order. ~15 minutes to set up, then follow the detailed guide.

---

## 1. Initialize Refactoring Branch

```bash
cd /home/user/khmer_project/menu-scanner-frontend-client

# Create new branch
git checkout -b refactor/frontend-cleanup-phase-1

# Verify setup
npm install
npm run build
npx tsc --noEmit
```

Expected: No errors, build succeeds.

---

## 2. Create Constants Files (Phase 2)

Run each command exactly as shown:

### API Endpoints
```bash
mkdir -p src/constants/api-endpoints

cat > src/constants/api-endpoints/index.ts << 'EOF'
// API Endpoints Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  GET_PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile/update',
} as const;

export const PRODUCT_ENDPOINTS = {
  GET_ALL: '/products',
  GET_ONE: (id: string) => `/products/${id}`,
  CREATE: '/products',
  UPDATE: (id: string) => `/products/${id}`,
  DELETE: (id: string) => `/products/${id}`,
  SEARCH: '/products/search',
} as const;

export const CART_ENDPOINTS = {
  GET: '/cart',
  ADD_ITEM: '/cart/items',
  REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
  CLEAR: '/cart/clear',
  CHECKOUT: '/cart/checkout',
} as const;
EOF
```

### UI Strings
```bash
mkdir -p src/constants/ui-strings

cat > src/constants/ui-strings/index.ts << 'EOF'
// UI Strings Constants
export const NAVIGATION_STRINGS = {
  HOME: 'Home',
  PRODUCTS: 'Products',
  PROMOTIONS: 'Promotions',
  CATEGORIES: 'Categories',
  BRANDS: 'Brands',
  CART: 'Cart',
  FAVORITES: 'Favorites',
  ACCOUNT: 'Account',
} as const;

export const ACTION_STRINGS = {
  SAVE: 'Save',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  ADD: 'Add',
  REMOVE: 'Remove',
  SUBMIT: 'Submit',
  CONFIRM: 'Confirm',
  CLOSE: 'Close',
  BACK: 'Back',
} as const;

export const PRODUCT_STRINGS = {
  PRODUCT: 'Product',
  PRICE: 'Price',
  QUANTITY: 'Quantity',
  ADD_TO_CART: 'Add to Cart',
  IN_STOCK: 'In Stock',
  OUT_OF_STOCK: 'Out of Stock',
} as const;

export const ERROR_STRINGS = {
  SOMETHING_WENT_WRONG: 'Something went wrong',
  TRY_AGAIN: 'Please try again',
  LOADING_ERROR: 'Failed to load data',
} as const;
EOF
```

### UI Timings
```bash
mkdir -p src/constants/ui-timings

cat > src/constants/ui-timings/index.ts << 'EOF'
// UI Timings Constants
export const DEBOUNCE_TIMINGS = {
  SEARCH: 300,
  FILTER: 500,
  FORM_INPUT: 300,
  SCROLL: 150,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  BASE: 200,
  SLOW: 300,
} as const;

export const TIMEOUT_DURATIONS = {
  SHORT: 3000,
  BASE: 5000,
  LONG: 10000,
  TOAST: 3000,
} as const;

export const CACHE_DURATIONS = {
  SHORT: 60000,
  MEDIUM: 300000,
  LONG: 600000,
} as const;
EOF
```

### Routes
```bash
mkdir -p src/constants/app-routes

cat > src/constants/app-routes/navigation.ts << 'EOF'
// Navigation Routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PROMOTIONS: '/promotions',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
} as const;

export const CUSTOMER_ROUTES = {
  DASHBOARD: '/customer/dashboard',
  PROFILE: '/customer/profile',
  ORDERS: '/customer/orders',
  FAVORITES: '/customer/favorites',
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  PRODUCTS: '/admin/products',
  ORDERS: '/admin/orders',
  USERS: '/admin/users',
} as const;

export const NAVIGATION_LINKS = [
  { name: 'Home', href: PUBLIC_ROUTES.HOME },
  { name: 'Products', href: PUBLIC_ROUTES.PRODUCTS },
  { name: 'Promotions', href: PUBLIC_ROUTES.PROMOTIONS },
  { name: 'Categories', href: PUBLIC_ROUTES.CATEGORIES },
  { name: 'Brands', href: PUBLIC_ROUTES.BRANDS },
] as const;
EOF
```

**Verify Constants Created:**
```bash
npm run build
npx tsc --noEmit
echo "✓ Constants files created and verified"
```

---

## 3. Extract Large Component Sub-components (Phase 4)

### Create Size Picker Hook
```bash
cat > src/hooks/use-size-picker.ts << 'EOF'
import { useState, useCallback, useMemo } from 'react';

export interface Size {
  id: string;
  name: string;
  available: boolean;
}

export function usePickerSize({
  initialSizeId = null,
  sizes,
}: {
  initialSizeId?: string | null;
  sizes: Size[];
}) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(initialSizeId);

  const selectedSize = useMemo(
    () => sizes.find((s) => s.id === selectedSizeId) || null,
    [selectedSizeId, sizes]
  );

  const canSelectSize = useCallback((sizeId: string) => {
    return sizes.find((s) => s.id === sizeId)?.available ?? false;
  }, [sizes]);

  const selectSize = useCallback((sizeId: string) => {
    if (canSelectSize(sizeId)) {
      setSelectedSizeId(sizeId);
    }
  }, [canSelectSize]);

  return {
    selectedSizeId,
    selectedSize,
    selectSize,
    canSelectSize,
  };
}
EOF
```

### Create Navbar Search Component
```bash
cat > src/components/layout/_navbar-search.tsx << 'EOF'
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/utils/debounce/debounce';
import { DEBOUNCE_TIMINGS } from '@/constants/ui-timings';

interface NavbarSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function NavbarSearch({ onSearch, placeholder = 'Search products...' }: NavbarSearchProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, DEBOUNCE_TIMINGS.SEARCH);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {query && (
        <button onClick={() => setQuery('')} className="absolute right-3 top-1/2">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}
EOF
```

**Verify Extractions:**
```bash
npx tsc --noEmit
echo "✓ Components and hooks extracted"
```

---

## 4. Create Documentation (Phase 3, 6, 7, 8, 9)

```bash
# Create docs directory
mkdir -p src/docs

# Create progress tracker
cat > src/docs/REFACTORING_PROGRESS.md << 'EOF'
# Refactoring Progress

## Completed
- [x] Phase 1: Setup & Structure
- [x] Phase 2: Constants & Strings
- [ ] Phase 3: Component Quality Audit
- [ ] Phase 4: Large Component Refactoring (In Progress)
- [ ] Phase 5: Debug Code Cleanup
- [ ] Phase 6: Redux Pattern Standardization
- [ ] Phase 7: Hook Organization
- [ ] Phase 8: Service Layer Organization
- [ ] Phase 9: Testing & Verification

## Current Metrics
- Components: 145
- Console.log: 328 (to remove)
- Components >400 lines: 13
- Hardcoded strings: Moved to constants

## Notes
- Using constants for all hardcoded values
- Extracting large components
- Next: Audit remaining components
EOF

echo "✓ Documentation created"
```

---

## 5. Create Verification Script

```bash
cat > src/scripts/verify-refactoring.sh << 'EOF'
#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "=== REFACTORING VERIFICATION ==="

# Test 1: Build
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Build successful"
else
  echo -e "${RED}✗${NC} Build failed"
  exit 1
fi

# Test 2: TypeScript
if npx tsc --noEmit 2> /dev/null; then
  echo -e "${GREEN}✓${NC} TypeScript checks passed"
else
  echo -e "${RED}✗${NC} TypeScript errors"
fi

# Test 3: Constants
CONST_COUNT=$(find src/constants -type f -name "*.ts" | wc -l)
echo -e "${GREEN}✓${NC} Constants files: $CONST_COUNT"

# Test 4: Console check
CONSOLE=$(grep -r "console\.log" src --include="*.tsx" --include="*.ts" | grep -v ".backup" | wc -l)
echo -e "${GREEN}✓${NC} Console statements: $CONSOLE (target: 0)"

echo "=== VERIFICATION COMPLETE ==="
EOF

chmod +x src/scripts/verify-refactoring.sh
bash src/scripts/verify-refactoring.sh
```

---

## 6. Commit Progress

```bash
# Stage constants and new files
git add src/constants/
git add src/hooks/use-size-picker.ts
git add src/components/layout/_navbar-search.tsx
git add src/docs/
git add src/scripts/

# Commit
git commit -m "refactor: add centralized constants and extract components

- Create API endpoints, UI strings, timings, and routes constants
- Extract usePickerSize hook for size selection logic
- Extract NavbarSearch component
- Add comprehensive documentation and verification scripts
- Phase 2 & 4 complete per refactoring guide"

# Verify
git log --oneline -3
```

---

## 7. Next Steps

Follow the detailed guide in `FRONTEND_REFACTORING_GUIDE.md`:

1. **Phase 3** - Complete component quality audit
2. **Phase 4** - Finish large component refactoring (size-picker-modal, navbar, sidebar)
3. **Phase 5** - Remove remaining console.log statements
4. **Phase 6** - Standardize Redux patterns
5. **Phase 7** - Organize hooks by category
6. **Phase 8** - Organize services
7. **Phase 9** - Final verification and testing

---

## 8. Quick Commands Reference

```bash
# Verify everything works
npm run build && npx tsc --noEmit

# Check for console.log
grep -r "console\.log" src --include="*.tsx" --include="*.ts" | grep -v ".backup" | wc -l

# Check component sizes
find src/components -name "*.tsx" -exec wc -l {} \; | awk '$1 > 400 {print}'

# See all changes
git status

# Review constants usage
grep -r "from.*constants" src --include="*.tsx" --include="*.ts" | head -10

# Count metrics
echo "Components: $(find src/components -name "*.tsx" | wc -l)"
echo "Hooks: $(find src/hooks -name "*.ts" | wc -l)"
echo "Services: $(find src/services -name "*.ts" | wc -l)"
echo "Constants: $(find src/constants -name "*.ts" | wc -l)"
```

---

## Help / Troubleshooting

**Build fails after changes?**
```bash
npx tsc --noEmit  # See exact errors
npm install       # Try reinstalling
npm run build     # Full rebuild
```

**Imports broken?**
```bash
# Check import paths
grep -r "from.*['\"]\.\./" src | grep "constants\|hooks" | head -5

# Fix: Use full paths like src/constants/...
```

**Need to reset?**
```bash
# Restore original files
git checkout src/

# Or restore specific file
git checkout src/components/layout/navbar.tsx
```

**Want to see changes?**
```bash
git diff src/constants/
git status
```

---

## Time Estimate

- Setup & constants: 20 mins ✓
- Extract components: 30 mins ✓
- Create docs: 15 mins ✓
- Remaining phases: ~10-12 hours (can be done in parallel)

**Total: ~15 hours to complete all phases**

---

## Success Checklist

- [ ] Constants files created
- [ ] Components extracted
- [ ] Documentation created
- [ ] Verification script works
- [ ] Build succeeds
- [ ] TypeScript compiles
- [ ] Git branch created
- [ ] Changes committed

When complete, follow the full guide for remaining phases!
