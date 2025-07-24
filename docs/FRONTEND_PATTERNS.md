# Frontend Development Patterns

This document provides detailed implementation patterns and examples for frontend development in the Smogon Tournament Stats React application. For general coding standards, see [Coding Standards](./CODING_STANDARDS.md).

## Component Organization

### File Structure Pattern

```
src/app/
├── components/          # Reusable UI components
│   ├── navigation/     # Navigation components
│   ├── layout/         # Layout components
│   ├── table/          # Table components
│   ├── filters/        # Filter components
│   ├── modal/          # Modal components
│   └── button/         # Button components
├── pages/              # Page-level components
├── store/              # Redux store and API definitions
├── auth/               # Authentication components
├── styles/             # Global styles and themes
└── types/              # TypeScript type definitions
```

### Component Naming Conventions

#### ✅ Good Examples from Codebase

```typescript
// Page components - end with "Page"
export function TournamentsPage() {}
export function PlayerDetailPage() {}

// UI components - descriptive nouns
export function PageTitle() {}
export function NavLinks() {}
export function FilterDropdown() {}

// Layout components - descriptive of their purpose
export function Container() {}
export function Grid() {}
```

#### ❌ Avoid

```typescript
// Too generic
export function Component() {}
export function Item() {}

// Using default exports
export default function SomeComponent() {}
```

## Component Architecture

### Component Structure Pattern

```typescript
// Example from apps/stats-ui/src/app/components/card/card.tsx
import styled from 'styled-components';
import { ReactNode, PropsWithChildren } from 'react';

// 1. Styled components first
const StyledCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
`;

// 2. Props interface
interface CardProps extends PropsWithChildren {
  title?: string;
  children?: ReactNode;
}

// 3. Component implementation
export function Card({ title, children }: CardProps) {
  return (
    <StyledCard>
      {title && <CardTitle>{title}</CardTitle>}
      {children}
    </StyledCard>
  );
}
```

### Component Guidelines

- Use **functional components** with hooks
- Export components as named exports (not default)
- Use `PascalCase` for component names
- Define prop interfaces above the component
- Use optional props (`?`) sparingly and document when they're undefined
- Keep components focused on a single responsibility

## Styled Components Patterns

### Design System

Based on the global styles, use these consistent values:

```typescript
// Colors
const colors = {
  primary: '#0066cc',
  primaryHover: '#004499',
  background: '#f5f5f5',
  white: '#ffffff',
  gray: {
    100: '#f8f9fa',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#6c757d',
    600: '#495057',
    700: '#343a40',
    800: '#212529',
  },
  success: '#28a745',
  error: '#dc3545',
};

// Spacing (use rem units)
const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
};
```

### Responsive Design Pattern

```typescript
// Example from the codebase - mobile-first approach
const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }

  @media screen and (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;
```

### State-based Styling

```typescript
// Example from navigation component
const StyledNavLink = styled.div<{ active?: boolean }>`
  a {
    color: ${(props) => (props.active ? '#64b5f6' : '#fff')};
    font-weight: ${(props) => (props.active ? '600' : '500')};
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #64b5f6;
    }
  }
`;
```

### Styling Guidelines

- Use **styled-components** for all component styling
- Define styled components at the top of the file
- Use descriptive names for styled components
- Leverage theme props for consistent colors and spacing
- Use CSS Grid and Flexbox for layouts
- Follow mobile-first responsive design principles

## State Management Patterns

### RTK Query API Definition

```typescript
// Example from apps/stats-ui/src/app/store/apis/players.api.ts
export const playersApi = createApi({
  reducerPath: 'playersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['Player'],
  endpoints: (builder) => ({
    getPlayers: builder.query<Player[], GetPlayersParams>({
      query: (params) => ({
        url: 'players',
        params: {
          ...Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined)),
        },
      }),
      providesTags: ['Player'],
    }),
    getPlayerById: builder.query<PlayerDetail, string>({
      query: (id) => `players/${id}`,
      providesTags: (result, error, id) => [{ type: 'Player', id }],
    }),
    addPlayerAlias: builder.mutation<void, AddPlayerAliasRequest>({
      query: ({ playerId, alias }) => ({
        url: `players/${playerId}/alias`,
        method: 'POST',
        body: { alias },
      }),
      invalidatesTags: (result, error, { playerId }) => [{ type: 'Player', id: playerId }],
    }),
  }),
});

export const { useGetPlayersQuery, useGetPlayerByIdQuery, useAddPlayerAliasMutation } = playersApi;
```

### Local State Management

#### Form State Pattern

```typescript
// Example from tournament creation modal
export function TournamentModal() {
  const [formData, setFormData] = useState({
    name: '',
    sheetName: '',
    sheetId: '',
    isOfficial: false,
    isTeam: false,
    year: new Date().getFullYear(),
  });

  const handleInputChange = (field: keyof typeof formData) => (value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Usage
  <input value={formData.name} onChange={(e) => handleInputChange('name')(e.target.value)} />;
}
```

#### Filter State Pattern

```typescript
// Example from the codebase - using custom hook for filter management
export function useFilterDropdown<T>(options: T[]) {
  const [selectedValues, setSelectedValues] = useState<T[]>([]);
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const toggleFilter = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const handleCheckboxChange = (value: T) => {
    setSelectedValues((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const clearFilters = () => {
    setSelectedValues([]);
  };

  return {
    selectedValues,
    setSelectedValues,
    openFilter,
    toggleFilter,
    handleCheckboxChange,
    clearFilters,
  };
}
```

### State Management Guidelines

- Use **RTK Query** for server state management
- Use React's `useState` and `useReducer` for local component state
- Keep server state and client state separate
- Use proper cache invalidation strategies
- Implement optimistic updates where appropriate

## Component Patterns

### Page Component Pattern

```typescript
// Example structure for page components
export function PlayersPage() {
  // 1. State declarations
  const [filters, setFilters] = useState({});
  const [sortColumn, setSortColumn] = useState<SortColumn>('matcheswon');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 2. Custom hooks and API calls
  const { data: players, isLoading, error } = useGetPlayersQuery(filters);

  // 3. Event handlers
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // 4. Early returns for loading/error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

  // 5. Main render
  return (
    <Container>
      <PageTitle>Players</PageTitle>
      {/* Component content */}
    </Container>
  );
}
```

### Modal Component Pattern

```typescript
// Example from the codebase
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function Modal({ isOpen, onClose, onSubmit, isLoading }: ModalProps) {
  // Don't render if not open
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Create Tournament</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>{/* Form content */}</form>
      </ModalContent>
    </Overlay>
  );
}
```

### Table Component Pattern

```typescript
// Reusable table component pattern
interface TableProps {
  data: any[];
  columns: ColumnDefinition[];
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export function Table({ data, columns, sortable, onSort }: TableProps) {
  return (
    <StyledTable>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} onClick={sortable ? () => onSort?.(column.key, 'asc') : undefined}>
              {column.label}
              {sortable && <SortIcon />}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.render ? column.render(row) : row[column.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    </StyledTable>
  );
}
```

## Routing Patterns

### Route Organization

```typescript
// Example from apps/stats-ui/src/app/app.tsx
function AppContent() {
  const location = useLocation();

  return (
    <StyledApp>
      <Nav currentPath={location.pathname} />
      <MainContent>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerDetailPage />} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </MainContent>
    </StyledApp>
  );
}
```

### Protected Route Pattern

```typescript
// Example from apps/stats-ui/src/app/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

### Navigation Guidelines

- Use **React Router** for client-side routing
- Define routes in a central location (`app.tsx`)
- Use descriptive route paths that match the UI structure
- Implement protected routes for authenticated areas
- Use TypeScript for route parameters

## Error Handling Patterns

### API Error Handling

```typescript
// In components using RTK Query
export function PlayersPage() {
  const { data: players, isLoading, error } = useGetPlayersQuery(params);

  // Handle different error states
  if (error) {
    if ('status' in error) {
      // RTK Query error with status
      const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);
      return <div>API Error: {errMsg}</div>;
    } else {
      // Serialized error
      return <div>Error: {error.message}</div>;
    }
  }

  // Rest of component
}
```

### Form Validation Pattern

```typescript
interface FormErrors {
  [key: string]: string;
}

export function useFormValidation<T>(initialValues: T, validate: (values: T) => FormErrors) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof T) => (value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (onSubmit: (values: T) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validate(values);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(values);
    } else {
      setErrors(formErrors);
    }
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
  };
}
```

## Performance Patterns

### Memoization

```typescript
// Memoize expensive calculations
const ExpensiveComponent = memo(({ data, filters }: Props) => {
  const processedData = useMemo(() => {
    return data.filter((item) => (filters.generation ? item.generation === filters.generation : true)).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, filters]);

  return (
    <div>
      {processedData.map((item) => (
        <ItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
});
```

### Callback Optimization

```typescript
// Use useCallback for event handlers passed to child components
export function ParentComponent() {
  const [items, setItems] = useState([]);

  const handleItemClick = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <div>
      {items.map((item) => (
        <ChildComponent key={item.id} item={item} onClick={handleItemClick} />
      ))}
    </div>
  );
}
```

## Accessibility Patterns

### Form Accessibility

```typescript
export function AccessibleForm() {
  return (
    <form>
      <FormGroup>
        <StyledLabel htmlFor="playerName">Player Name *</StyledLabel>
        <StyledInput id="playerName" type="text" required aria-describedby="playerName-error" />
        <ErrorMessage id="playerName-error" role="alert">
          {errors.playerName}
        </ErrorMessage>
      </FormGroup>
    </form>
  );
}
```

### Button Accessibility

```typescript
const AccessibleButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  /* Ensure adequate color contrast */
  background-color: ${(props) => (props.variant === 'secondary' ? '#6c757d' : '#0066cc')};
  color: white;

  /* Focus indicators */
  &:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  /* Disabled state */
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
```

### Form Handling Guidelines

- Use controlled components for form inputs
- Validate forms on both client and server side
- Provide clear error messages and feedback
- Implement proper accessibility for forms

## Testing Patterns

### Component Testing

```typescript
// Example test pattern
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { PlayerCard } from './PlayerCard';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('PlayerCard', () => {
  const mockPlayer = {
    id: '1',
    name: 'Test Player',
    winRate: 75,
  };

  it('should display player information', () => {
    renderWithProviders(<PlayerCard player={mockPlayer} />);

    expect(screen.getByText('Test Player')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should navigate to player detail when clicked', () => {
    renderWithProviders(<PlayerCard player={mockPlayer} />);

    const card = screen.getByRole('link');
    expect(card).toHaveAttribute('href', '/players/1');
  });
});
```

### Testing Guidelines

- Use **React Testing Library** for component testing
- Test behavior, not implementation details
- Create reusable test utilities (`renderWithProviders`)
- Mock external dependencies appropriately
- Test user interactions and accessibility

This frontend patterns document focuses specifically on React/TypeScript implementation details while referencing the main coding standards for general guidelines.
