# Frontend Architecture - Quick Reference Guide

A condensed reference for developers implementing the Redux Toolkit architecture.

---

## File Creation Checklist for New Features

### For a new feature called "Invoice":

```
REDUX LAYER:
□ src/redux/features/invoice/invoiceSlice.ts
  - Create slice with initialState, reducers, extraReducers
  
□ src/redux/features/invoice/invoiceThunks.ts
  - Create fetchInvoicesThunk
  - Create createInvoiceThunk
  - Create updateInvoiceThunk
  - Create deleteInvoiceThunk
  
□ src/redux/features/invoice/invoiceSelectors.ts
  - Create select[Invoice]s (items)
  - Create selectSelected[Invoice] (detail)
  - Create select[Invoice]Loading
  - Create select[Invoice]Error
  - Create select[Invoice]ById (factory)

HOOK LAYER:
□ src/hooks/useInvoice.ts
  - Export useInvoice hook with all operations

SERVICE LAYER:
□ src/services/invoice/invoiceService.ts
  - Create getAll()
  - Create getById()
  - Create create()
  - Create update()
  - Create delete()

TYPE LAYER:
□ src/types/invoice.ts
  - Define Invoice interface
  - Define InvoiceState interface
  - Define request/response types

COMPONENT LAYER:
□ src/components/invoice/InvoiceList.tsx
□ src/components/invoice/InvoiceForm.tsx
□ src/components/invoice/InvoiceDetail.tsx
□ src/components/invoice/index.ts

PAGE LAYER:
□ src/app/admin/invoices/page.tsx
  - List page with CRUD operations
□ src/app/admin/invoices/[id]/page.tsx
  - Detail page
□ src/app/admin/invoices/new/page.tsx
  - Create page

CONSTANTS:
□ Add routes to src/constants/routes.ts
□ Add messages to src/constants/messages.ts
□ Add API endpoints to src/services/api/endpoints.ts
```

---

## Common Code Patterns

### 1. Fetch List with Pagination
```typescript
// Component
const { invoices, isLoading, fetchAll } = useInvoice();
const { filters, getPaginationParams, setPage } = useListFilters();

useEffect(() => {
  fetchAll(getPaginationParams());
}, [filters, fetchAll, getPaginationParams]);

// Display
{isLoading && <LoadingSpinner />}
{!isLoading && invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}
<Pagination currentPage={filters.page} onPageChange={setPage} />
```

### 2. Create/Update Form
```typescript
// Hook in component
const { isLoading, error, execute } = useAsyncOperation();
const { create, update } = useInvoice();
const { values, setValue, setErrors, reset } = useFormState({});

// Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  const errors = validateForm(values);
  
  if (errors.length > 0) {
    setErrors(errors);
    return;
  }
  
  await execute(async () => {
    if (editId) {
      await update(editId, values);
    } else {
      await create(values);
    }
    reset();
    closeModal();
  });
};
```

### 3. Delete with Confirmation
```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;
  
  await execute(async () => {
    await deleteInvoice(id);
    notify.success('Invoice deleted');
    refetch();
  });
};
```

### 4. Search/Filter
```typescript
const { query, handleSearch } = useSearch((q) => {
  setFilters({ ...filters, searchQuery: q, page: 1 });
});

return (
  <>
    <Input 
      placeholder="Search..." 
      onChange={(e) => handleSearch(e.target.value)}
    />
    {/* List updates via filters dependency */}
  </>
);
```

### 5. Modal Form
```typescript
const { isOpen, open, close } = useModalState('invoice-form');

return (
  <>
    <Button onClick={open}>New Invoice</Button>
    <Modal isOpen={isOpen} onClose={close} title="Create Invoice">
      <InvoiceForm onSubmit={handleSubmit} />
    </Modal>
  </>
);
```

---

## Redux Pattern Template

### Step 1: Define Types
```typescript
// src/types/invoice.ts
export interface Invoice {
  id: string;
  number: string;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
}

export interface InvoiceState {
  items: Invoice[];
  selectedInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}
```

### Step 2: Create Thunks
```typescript
// src/redux/features/invoice/invoiceThunks.ts
export const fetchInvoicesThunk = createAsyncThunk<
  PaginationResponse<Invoice>,
  PaginationParams,
  { rejectValue: string }
>(
  'invoice/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await invoiceService.getAll(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed');
    }
  }
);
```

### Step 3: Create Slice
```typescript
// src/redux/features/invoice/invoiceSlice.ts
const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: { /* sync actions */ },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoicesThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvoicesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.content;
        state.totalCount = action.payload.totalElements;
      })
      .addCase(fetchInvoicesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});
```

### Step 4: Create Selectors
```typescript
// src/redux/features/invoice/invoiceSelectors.ts
export const selectInvoices = (state: RootState) => state.invoice.items;
export const selectSelectedInvoice = (state: RootState) => state.invoice.selectedInvoice;
export const selectInvoiceLoading = (state: RootState) => state.invoice.isLoading;
export const selectInvoiceError = (state: RootState) => state.invoice.error;
```

### Step 5: Create Hook
```typescript
// src/hooks/useInvoice.ts
export const useInvoice = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectInvoices);
  const isLoading = useAppSelector(selectInvoiceLoading);
  
  const fetchAll = useCallback(
    (params: PaginationParams) => dispatch(fetchInvoicesThunk(params)),
    [dispatch]
  );
  
  return { items, isLoading, fetchAll };
};
```

---

## Component Patterns

### Basic List Component
```typescript
interface InvoiceListProps {
  items: Invoice[];
  isLoading?: boolean;
  onEdit?: (item: Invoice) => void;
  onDelete?: (id: string) => void;
}

export const InvoiceList = ({ items, isLoading, onEdit, onDelete }: InvoiceListProps) => {
  if (isLoading) return <LoadingSpinner />;
  if (items.length === 0) return <EmptyState message="No invoices found" />;
  
  return (
    <table>
      <tbody>
        {items.map(inv => (
          <tr key={inv.id}>
            <td>{inv.number}</td>
            <td>${inv.total}</td>
            <td>{inv.status}</td>
            <td>
              <Button onClick={() => onEdit?.(inv)}>Edit</Button>
              <Button onClick={() => onDelete?.(inv.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Form Component
```typescript
interface InvoiceFormProps {
  onSubmit: (data: Partial<Invoice>) => Promise<void>;
  initialValues?: Partial<Invoice>;
}

export const InvoiceForm = ({ onSubmit, initialValues = {} }: InvoiceFormProps) => {
  const { values, setValue, setErrors } = useFormState(initialValues);
  const { isLoading, error, execute } = useAsyncOperation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await execute(() => onSubmit(values));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error">{error}</Alert>}
      <Input 
        label="Number"
        value={values.number || ''}
        onChange={(e) => setValue('number', e.target.value)}
      />
      <Input 
        label="Total"
        type="number"
        value={values.total || ''}
        onChange={(e) => setValue('total', Number(e.target.value))}
      />
      <Button type="submit" isLoading={isLoading}>Submit</Button>
    </form>
  );
};
```

### Page with CRUD
```typescript
export default function InvoicePage() {
  const { items, isLoading, fetchAll, create, update, delete: deleteInvoice } = useInvoice();
  const { getPaginationParams, setPage } = useListFilters();
  const { isOpen, open, close } = useModalState('form');
  const { success, error } = useNotification();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAll(getPaginationParams());
  }, []);
  
  const handleSubmit = async (data: any) => {
    try {
      if (editingId) {
        await update(editingId, data);
        success('Updated');
      } else {
        await create(data);
        success('Created');
      }
      close();
      fetchAll(getPaginationParams());
    } catch (err) {
      error(getErrorMessage(err));
    }
  };
  
  return (
    <div>
      <Button onClick={open}>Add Invoice</Button>
      <InvoiceList items={items} isLoading={isLoading} />
      <Modal isOpen={isOpen} onClose={close} title="Invoice">
        <InvoiceForm onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
```

---

## Hook Patterns

### Data Fetching Hook
```typescript
export const useInvoice = () => {
  const dispatch = useAppDispatch();
  
  const items = useAppSelector(selectInvoices);
  const isLoading = useAppSelector(selectInvoiceLoading);
  const error = useAppSelector(selectInvoiceError);
  
  const fetchAll = useCallback(
    (params) => dispatch(fetchInvoicesThunk(params)),
    [dispatch]
  );
  
  const create = useCallback(
    (data) => dispatch(createInvoiceThunk(data)),
    [dispatch]
  );
  
  return { items, isLoading, error, fetchAll, create };
};
```

### Form State Hook
```typescript
const { values, setValue, setErrors, formState } = useFormState({
  number: '',
  total: 0,
});

setValue('number', 'INV-001');
setErrors({ number: 'Required' });
console.log(formState.number.error); // 'Required'
```

### List Filters Hook
```typescript
const { filters, getPaginationParams, setSearchQuery, setPage } = useListFilters(20);

setSearchQuery('invoice');
setPage(2);
const params = getPaginationParams(); // { pageNumber: 2, pageSize: 20, searchQuery: 'invoice' }
```

### Async Operation Hook
```typescript
const { isLoading, error, execute, clearError } = useAsyncOperation();

await execute(async () => {
  await invoiceService.create(data);
});

if (error) console.error(error);
```

---

## Common Mistakes & Fixes

### ❌ Mistake 1: Props Drilling
```typescript
// DON'T DO THIS
<InvoiceList 
  items={items} 
  isLoading={isLoading} 
  error={error}
  onFetch={fetchAll}
/>

// DO THIS
export const InvoiceList = () => {
  const { items, isLoading } = useInvoice();
  // ...
};
```

### ❌ Mistake 2: Not Using Selectors
```typescript
// DON'T DO THIS
const state = useAppSelector(state => state);
const invoices = state.invoice.items;

// DO THIS
const invoices = useAppSelector(selectInvoices);
```

### ❌ Mistake 3: Redux State Duplication
```typescript
// DON'T DO THIS
const [invoices, setInvoices] = useState([]);
const reduxInvoices = useAppSelector(selectInvoices);

// DO THIS
const invoices = useAppSelector(selectInvoices);
```

### ❌ Mistake 4: Not Using Custom Hooks
```typescript
// DON'T DO THIS
const dispatch = useAppDispatch();
const items = useAppSelector(selectInvoices);
const fetchAll = () => dispatch(fetchInvoicesThunk(...));

// DO THIS
const { items, fetchAll } = useInvoice();
```

### ❌ Mistake 5: Inline Functions in Dependencies
```typescript
// DON'T DO THIS
useEffect(() => {
  const func = () => { };
  fetchAll(func);
}, [fetchAll]);

// DO THIS
const handleFetch = useCallback(() => { }, []);
useEffect(() => {
  fetchAll(handleFetch);
}, [fetchAll, handleFetch]);
```

---

## Performance Optimization Tips

### 1. Use Selector Memoization
```typescript
// Memoized selector prevents unnecessary re-renders
export const selectInvoiceById = (id: string) => (state: RootState) =>
  state.invoice.items.find(inv => inv.id === id);
```

### 2. Split Components by Data Dependencies
```typescript
// InvoiceListContainer - manages data
export const InvoiceListContainer = () => {
  const { items } = useInvoice();
  return <InvoiceListPresentation items={items} />;
};

// InvoiceListPresentation - just renders
export const InvoiceListPresentation = ({ items }) => (
  <table>
    {items.map(item => <InvoiceRow key={item.id} item={item} />)}
  </table>
);
```

### 3. Lazy Load Components
```typescript
import dynamic from 'next/dynamic';

const InvoiceForm = dynamic(() => import('./InvoiceForm'), {
  loading: () => <LoadingSpinner />,
});
```

### 4. Debounce Search
```typescript
const { query, handleSearch } = useSearch((q) => {
  // Only triggers after 500ms of no typing
  setFilters(prev => ({ ...prev, searchQuery: q }));
});
```

---

## Testing Checklist

```typescript
// Test Redux Slice
□ Test reducers with different states
□ Test thunks with success/error cases

// Test Hooks
□ Test data fetching
□ Test loading states
□ Test error handling
□ Test state updates

// Test Components
□ Test rendering with props
□ Test user interactions
□ Test async operations
□ Test error boundaries

// Test Pages
□ Test data loading
□ Test CRUD operations
□ Test pagination
□ Test filters
```

---

## Debugging Tips

### Check Redux State
```typescript
// In component
const state = useAppSelector(state => {
  console.log('Redux state:', state);
  return state.invoice;
});
```

### Check Hook Calls
```typescript
// Track hook calls
const useInvoice = () => {
  console.log('useInvoice called');
  return { /* ... */ };
};
```

### Network Inspection
```typescript
// Check API calls in browser DevTools
// Network tab → filter by /api
// Check request headers, response body
```

### Redux DevTools
```typescript
// Install Redux DevTools extension
// Open DevTools → Redux tab
// Inspect all state changes and time travel
```

---

## Directory Quick Links

```
Redux Setup:
  src/redux/store.ts
  src/redux/hooks.ts

Auth Feature:
  src/redux/features/auth/
  src/hooks/useAuth.ts
  src/services/auth/authService.ts

Product Feature:
  src/redux/features/product/
  src/hooks/useProduct.ts
  src/services/product/productService.ts

Components:
  src/components/base/          # Reusable UI
  src/components/auth/          # Auth-specific
  src/components/product/       # Product-specific

Types:
  src/types/auth.ts
  src/types/product.ts
  src/types/api.ts

Utils:
  src/utils/storage/
  src/utils/format/
  src/utils/validation/

Constants:
  src/constants/routes.ts
  src/constants/messages.ts
  src/constants/app.ts
```

---

## Getting Help

1. Check the main guide: `FRONTEND_ARCHITECTURE_COMPLETE.md`
2. Check templates: `FRONTEND_IMPLEMENTATION_TEMPLATES.md`
3. Check alignment: `FRONTEND_BACKEND_ALIGNMENT.md`
4. Check setup: `FRONTEND_SETUP_GUIDE.md`

All files follow the same clean code principles - no duplication, clear naming, single responsibility.
