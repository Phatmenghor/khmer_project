# Frontend Refactoring - Implementation Checklist

**Copy-paste this checklist into your project.** Mark items as you complete them.

---

## PHASE 1: Setup & Structure ⏱️ 30 mins

```bash
# Run these commands in order
cd /home/user/khmer_project/menu-scanner-frontend-client
git checkout -b refactor/frontend-cleanup-phase-1
```

- [ ] Create git branch for refactoring
- [ ] Verify build works: `npm run build`
- [ ] Verify TypeScript: `npx tsc --noEmit`
- [ ] Create documentation folder: `mkdir -p src/docs`
- [ ] List current structure: `ls -la src/`

**Verification:** Build passes, no errors shown.

---

## PHASE 2: Constants & Strings Management ⏱️ 1-2 hours

### API Endpoints
- [ ] Create `src/constants/api-endpoints/index.ts`
- [ ] Add AUTH_ENDPOINTS
- [ ] Add PRODUCT_ENDPOINTS
- [ ] Add CART_ENDPOINTS
- [ ] Add CATEGORY_ENDPOINTS
- [ ] Add BRAND_ENDPOINTS
- [ ] Add BUSINESS_ENDPOINTS
- [ ] Add ORDER_ENDPOINTS
- [ ] Add PROMOTION_ENDPOINTS
- [ ] Add USER_ENDPOINTS
- [ ] Add REVIEW_ENDPOINTS
- [ ] Add ANALYTICS_ENDPOINTS

### UI Strings
- [ ] Create `src/constants/ui-strings/index.ts`
- [ ] Add NAVIGATION_STRINGS
- [ ] Add ACTION_STRINGS
- [ ] Add PRODUCT_STRINGS
- [ ] Add CART_STRINGS
- [ ] Add AUTH_STRINGS
- [ ] Add FORM_STRINGS
- [ ] Add ERROR_STRINGS
- [ ] Add SUCCESS_STRINGS
- [ ] Add DIALOG_STRINGS
- [ ] Add VALIDATION_STRINGS

### UI Timings
- [ ] Create `src/constants/ui-timings/index.ts`
- [ ] Add DEBOUNCE_TIMINGS
- [ ] Add THROTTLE_TIMINGS
- [ ] Add ANIMATION_DURATIONS
- [ ] Add TIMEOUT_DURATIONS
- [ ] Add POLLING_INTERVALS
- [ ] Add DELAY_TIMINGS
- [ ] Add RETRY_TIMINGS
- [ ] Add CACHE_DURATIONS
- [ ] Add SCROLL_TIMINGS

### Routes
- [ ] Create `src/constants/app-routes/navigation.ts`
- [ ] Add PUBLIC_ROUTES
- [ ] Add AUTH_ROUTES
- [ ] Add CUSTOMER_ROUTES
- [ ] Add ADMIN_ROUTES
- [ ] Add POS_ROUTES
- [ ] Add UTILITY_ROUTES
- [ ] Add NAVIGATION_LINKS

### Verification
- [ ] Build passes: `npm run build`
- [ ] TypeScript passes: `npx tsc --noEmit`
- [ ] All constants files exist
- [ ] Can import from constants without errors

---

## PHASE 3: Component Quality Audit ⏱️ 1-2 hours

- [ ] Find large components: `find src/components -name "*.tsx" -exec wc -l {} \; | awk '$1 > 400'`
- [ ] List top 20 components by size
- [ ] Create `src/docs/COMPONENT_AUDIT.md`
- [ ] Document components >600 lines:
  - [ ] size-picker-modal.tsx (839 lines)
  - [ ] navbar.tsx (818 lines)
  - [ ] sidebar.tsx (773 lines)
  - [ ] product-card.tsx (695 lines)
  - [ ] size-selection-modal.tsx (579 lines)
- [ ] Count console.log statements: `grep -r "console\.log" src --include="*.tsx" --include="*.ts" | wc -l`
- [ ] List files with console.log: `find src -name "*.tsx" -o -name "*.ts" | while read f; do count=$(grep -c "console\." "$f" 2>/dev/null || echo 0); if [ "$count" -gt 0 ]; then echo "$count:$f"; fi; done | sort -rn`
- [ ] Check naming conventions: `find src/components -type f -name "*.tsx" | grep -E '[A-Z].*\.tsx'`
- [ ] Create `src/docs/naming-convention-report.txt`
- [ ] Create `src/docs/console-cleanup-report.txt`

**Verification:** Audit reports complete, accurate metrics recorded.

---

## PHASE 4: Large Component Refactoring ⏱️ 4-6 hours

### For size-picker-modal.tsx (839 lines)

- [ ] Create backup: `cp src/components/shared/modal/size-picker-modal.tsx src/components/shared/modal/size-picker-modal.tsx.backup`
- [ ] Create `src/hooks/use-size-picker.ts` hook
- [ ] Create `src/components/shared/modal/_size-picker-grid.tsx` component
- [ ] Create `src/components/shared/modal/_size-picker-summary.tsx` component (if complex)
- [ ] Update main component to use new hook
- [ ] Remove extracted logic from modal
- [ ] Test functionality end-to-end
- [ ] Verify component <400 lines
- [ ] TypeScript check passes: `npx tsc --noEmit`

### For navbar.tsx (818 lines)

- [ ] Create backup: `cp src/components/layout/navbar.tsx src/components/layout/navbar.tsx.backup`
- [ ] Create `src/components/layout/_navbar-search.tsx` component
- [ ] Create `src/components/layout/_navbar-user-menu.tsx` component
- [ ] Create `src/components/layout/_navbar-mobile-menu.tsx` component
- [ ] Update main navbar to use sub-components
- [ ] Remove extracted code
- [ ] Test all navbar features:
  - [ ] Search works
  - [ ] User menu works
  - [ ] Mobile menu works
  - [ ] Navigation works
- [ ] Verify component <400 lines

### For sidebar.tsx (773 lines)

- [ ] Create backup: `cp src/components/ui/sidebar.tsx src/components/ui/sidebar.tsx.backup`
- [ ] Create `src/components/ui/_sidebar-nav.tsx` component
- [ ] Create `src/components/ui/_sidebar-sections.tsx` component
- [ ] Create `src/components/ui/_sidebar-footer.tsx` component
- [ ] Update main component
- [ ] Test navigation and collapsing

### For product-card.tsx (695 lines)

- [ ] Create backup
- [ ] Create `src/components/shared/card/_product-image.tsx`
- [ ] Create `src/components/shared/card/_product-info.tsx`
- [ ] Create `src/components/shared/card/_product-actions.tsx`
- [ ] Update main component
- [ ] Test card display and interactions

### For size-selection-modal.tsx (579 lines)

- [ ] Create backup
- [ ] Reuse usePickerSize hook
- [ ] Extract modal-specific components
- [ ] Reduce to <400 lines

### Verification
- [ ] All large components refactored
- [ ] All backups created
- [ ] Build passes: `npm run build`
- [ ] TypeScript passes
- [ ] No console errors
- [ ] All components <400 lines
- [ ] Create `src/docs/LARGE_COMPONENT_REFACTORING.md` with status

---

## PHASE 5: Debug Code Cleanup ⏱️ 1-2 hours

- [ ] Create `src/docs/CONSOLE_CLEANUP_CHECKLIST.md`
- [ ] Create console statement list: `grep -rn "console\.log\|console\.error\|console\.warn" src --include="*.tsx" --include="*.ts" > src/docs/console-statements.txt`
- [ ] Identify high-priority files (most console statements):
  - [ ] Top file 1: [Remove all console.log]
  - [ ] Top file 2: [Remove all console.log]
  - [ ] Top file 3: [Remove all console.log]
  - [ ] ... (continue for top 20)

### For Each File with Console Logs

- [ ] Review each console statement
- [ ] Determine if needed (almost never)
- [ ] Remove the line entirely
- [ ] Ensure surrounding code valid
- [ ] Verify no syntax errors

### Verification
- [ ] Total console.log removed: 328 → 0
- [ ] Build passes
- [ ] TypeScript passes
- [ ] No broken code
- [ ] Create `.eslintrc.json` rule (optional but recommended):
  ```json
  {
    "rules": {
      "no-console": ["error", { "allow": ["warn", "error"] }]
    }
  }
  ```

---

## PHASE 6: Redux Pattern Standardization ⏱️ 2-3 hours

### Audit Current Redux

- [ ] List all Redux slices: `find src/redux -name "*slice.ts"`
- [ ] Count slices: ___ total
- [ ] List all thunks: `find src/redux -name "*thunk*.ts"`
- [ ] Count thunks: ___ total
- [ ] List all selectors: `find src/redux -name "*selector*.ts"`
- [ ] Count selectors: ___ total
- [ ] Check state interfaces: `grep -r "interface.*State" src/redux`

### Create Redux Documentation

- [ ] Create `src/docs/REDUX_PATTERNS.md`
- [ ] Document slice pattern
- [ ] Document thunk pattern
- [ ] Document selector pattern
- [ ] Document hook pattern
- [ ] Create `src/docs/REDUX_COMPLIANCE_CHECKLIST.md`

### For Each Redux Feature

- [ ] Verify folder structure:
  - [ ] `store/slice/[feature]-slice.ts` exists
  - [ ] `store/thunks/[feature]-thunks.ts` exists (if async)
  - [ ] `store/selectors/[feature]-selectors.ts` exists
  - [ ] `store/state/[feature]-state.ts` exists
  - [ ] `hooks/use-[feature]-state.ts` exists
- [ ] Verify naming consistency
- [ ] Verify TypeScript types defined
- [ ] Verify selectors use createSelector
- [ ] Verify custom hook exports all selectors

### Verification
- [ ] All features follow standard pattern
- [ ] No direct state access in components
- [ ] Custom hooks used everywhere
- [ ] TypeScript passes

---

## PHASE 7: Hook Organization ⏱️ 1-2 hours

### Create Hook Subdirectories

```bash
mkdir -p src/hooks/use-redux
mkdir -p src/hooks/use-data-fetching
mkdir -p src/hooks/use-forms
mkdir -p src/hooks/use-ui
mkdir -p src/hooks/use-local-storage
mkdir -p src/hooks/use-animations
```

- [ ] Subdirectories created
- [ ] Create `src/docs/HOOKS_ORGANIZATION.md`
- [ ] Create `src/docs/HOOKS_MIGRATION_CHECKLIST.md`

### Categorize and Move Hooks

- [ ] List all hooks: `ls -1 src/hooks/*.ts`
- [ ] Move Redux hooks → `use-redux/`
- [ ] Move data fetching hooks → `use-data-fetching/`
- [ ] Move form hooks → `use-forms/`
- [ ] Move UI hooks → `use-ui/`
- [ ] Move storage hooks → `use-local-storage/`
- [ ] Move animation hooks → `use-animations/`

### Update Imports

- [ ] Search for old import paths: `grep -r "from.*hooks" src --include="*.tsx"`
- [ ] Update imports to new categorized paths
- [ ] Verify no broken imports
- [ ] TypeScript check: `npx tsc --noEmit`

### Verify Hook Usage in Components

- [ ] No prop drilling (state passed through many levels)
- [ ] Components use custom hooks, not direct useSelector
- [ ] All Redux state accessed via custom hooks
- [ ] Dependencies correct in useEffect

---

## PHASE 8: Service Layer Organization ⏱️ 1 hour

### Verify Service Structure

```bash
ls -la src/services/
```

- [ ] `src/services/api/` exists (or create)
- [ ] `src/services/utilities/` exists (or create)
- [ ] `src/services/formatters/` exists (or create)
- [ ] `src/services/validators/` exists (or create)
- [ ] `src/services/transformers/` exists (or create)

### Create Service Documentation

- [ ] Create `src/docs/SERVICE_LAYER_GUIDE.md`
- [ ] Create `src/docs/SERVICE_LAYER_CHECKLIST.md`

### Organize Existing Services

- [ ] Audit current services: `find src/services -type f -name "*.ts"`
- [ ] Move API services to `api/`
- [ ] Move utility functions to `utilities/`
- [ ] Move formatters to `formatters/`
- [ ] Move validators to `validators/`
- [ ] Move transformers to `transformers/`

### Verify Service Usage

- [ ] No direct axios in components
- [ ] All API calls use centralized service
- [ ] Transformers handle data shape conversion
- [ ] Validators are reusable
- [ ] Formatters have consistent interface

---

## PHASE 9: Testing & Verification ⏱️ 1-2 hours

### Create Verification Script

- [ ] Create `src/scripts/verify-refactoring.sh`
- [ ] Make executable: `chmod +x src/scripts/verify-refactoring.sh`
- [ ] Run: `bash src/scripts/verify-refactoring.sh`

### Run All Checks

```bash
# Verify build
npm run build

# Verify TypeScript
npx tsc --noEmit

# Verify constants
find src/constants -type f -name "*.ts" | wc -l  # Should be 4+

# Verify console cleanup
grep -r "console\.log" src --include="*.tsx" --include="*.ts" | wc -l  # Should be 0

# Verify component sizes
find src/components -name "*.tsx" -exec wc -l {} \; | awk '$1 > 400' | wc -l  # Should be 0
```

- [ ] Build succeeds
- [ ] TypeScript compiles
- [ ] No breaking changes
- [ ] All metrics improved

### Manual Testing

- [ ] [ ] Login/Register works
- [ ] [ ] Product browsing works
- [ ] [ ] Cart add/remove works
- [ ] [ ] Search works
- [ ] [ ] Filter works
- [ ] [ ] Navigation works
- [ ] [ ] Responsive design works
- [ ] [ ] Error handling works
- [ ] [ ] Loading states show
- [ ] [ ] Toasts display

### Create Documentation

- [ ] Create `src/docs/FINAL_VERIFICATION_CHECKLIST.md`
- [ ] Create `src/docs/REFACTORING_SUMMARY.md`
- [ ] Create `src/docs/QUALITY_REPORT.md`
- [ ] Update `src/docs/REFACTORING_PROGRESS.md` with completion status

### Verification
- [ ] All documentation complete
- [ ] All tests pass
- [ ] Build successful
- [ ] No errors in console (Chrome DevTools)

---

## FINAL STEPS

### Commit Changes

```bash
git add src/constants/
git add src/hooks/
git add src/components/
git add src/services/
git add src/docs/
git add src/scripts/
git commit -m "refactor: complete frontend code cleanup and reorganization

Completed all 9 phases:
- Phase 1: Structure setup
- Phase 2: Constants management (API, UI strings, timings, routes)
- Phase 3: Component quality audit
- Phase 4: Large component refactoring
- Phase 5: Debug code cleanup
- Phase 6: Redux pattern standardization
- Phase 7: Hook organization and categorization
- Phase 8: Service layer organization
- Phase 9: Testing and verification

Changes:
- Centralized all hardcoded strings to constants
- Reduced large components from 800+ to <400 lines
- Removed 328 console.log statements
- Organized 145 components properly
- Standardized Redux patterns across all features
- Categorized and documented 50+ hooks
- Created comprehensive documentation

Build: ✓ Passes
TypeScript: ✓ Passes
Tests: ✓ All pass"
```

- [ ] Commit message descriptive
- [ ] All files staged
- [ ] Commit successful
- [ ] Can push to remote

### Review and Merge

- [ ] Create Pull Request
- [ ] Request code review
- [ ] Address review comments
- [ ] Verify CI/CD passes
- [ ] Merge to main branch

### Post-Merge

- [ ] Delete refactoring branch (optional)
- [ ] Deploy to staging environment
- [ ] Perform end-to-end testing
- [ ] Deploy to production
- [ ] Monitor for issues

---

## METRICS SUMMARY

**Before Refactoring:**
- Components: 145
- Console.log statements: 328
- Components >400 lines: 13
- Components >600 lines: 5
- Hardcoded strings: 50+

**After Refactoring (Goals):**
- Components: 145+ (smaller/more focused)
- Console.log statements: 0
- Components >400 lines: 0
- Components >600 lines: 0
- Hardcoded strings: 0 (all in constants)

**Additional Improvements:**
- Redux patterns: Standardized across all features
- Hooks: Organized and categorized by type
- Services: Centralized and documented
- Documentation: Complete with guides and checklists
- Code quality: Significantly improved

---

## HELP SECTION

**Build fails?**
```bash
npx tsc --noEmit  # See exact error
rm -rf .next      # Clear cache
npm install       # Reinstall
npm run build     # Rebuild
```

**TypeScript errors?**
```bash
npx tsc --noEmit  # List all errors
# Fix errors reported
npm run build     # Verify fix
```

**Import issues?**
```bash
# Find broken imports
grep -r "from.*['\"]\.\./" src | grep constants

# Use full paths instead
# from '../../constants/...' → from '@/constants/...'
```

**Need to rollback?**
```bash
# Revert last commit
git revert HEAD

# Or reset to before refactoring
git reset --hard <commit-before-refactoring>
```

**Want to see progress?**
```bash
# Show changed files
git status

# Show what changed
git diff src/constants/

# Show commit history
git log --oneline -10
```

---

## TIME ESTIMATES

| Phase | Time | Status |
|-------|------|--------|
| Phase 1: Setup | 30 mins | - |
| Phase 2: Constants | 1-2 hrs | - |
| Phase 3: Audit | 1-2 hrs | - |
| Phase 4: Large Components | 4-6 hrs | - |
| Phase 5: Debug Cleanup | 1-2 hrs | - |
| Phase 6: Redux | 2-3 hrs | - |
| Phase 7: Hooks | 1-2 hrs | - |
| Phase 8: Services | 1 hr | - |
| Phase 9: Verification | 1-2 hrs | - |
| **TOTAL** | **~15-20 hrs** | - |

*Can be parallelized - different team members can work on different phases.*

---

## SUCCESS CRITERIA

- [x] This checklist completed
- [x] All phases documented
- [x] Step-by-step instructions provided
- [x] Code examples included
- [x] Verification procedures defined
- [x] Documentation comprehensive

**Ready to start? Use `FRONTEND_REFACTORING_QUICK_START.md` for immediate next steps!**
