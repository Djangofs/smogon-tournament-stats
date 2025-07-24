# Coding Standards

This document outlines the core coding standards and conventions for the Smogon Tournament Stats project. For detailed implementation patterns, see the [Frontend Patterns](./FRONTEND_PATTERNS.md) and [Backend Patterns](./BACKEND_PATTERNS.md) documents.

## Table of Contents

- [General Guidelines](#general-guidelines)
- [Project Structure](#project-structure)
- [TypeScript Standards](#typescript-standards)
- [Code Formatting & Linting](#code-formatting--linting)
- [Testing Standards](#testing-standards)
- [Documentation Standards](#documentation-standards)
- [Enforcement](#enforcement)

## General Guidelines

### Code Quality Principles

- Write self-documenting code with clear, descriptive names
- Follow the Single Responsibility Principle
- Prefer composition over inheritance
- Keep functions small and focused (generally under 50 lines)
- Use meaningful variable and function names that describe intent

### Architecture Principles

- **Separation of concerns** between layers
- **Domain-driven organization** for backend APIs
- **Component-based architecture** for frontend
- **Shared code** in dedicated libraries

## Project Structure

### Nx Monorepo Organization

```
├── apps/                     # Applications
│   ├── stats-api/           # Backend API (Node.js/Express)
│   ├── stats-ui/            # Frontend React app
│   ├── stats-api-e2e/       # API E2E tests
│   └── stats-ui-e2e/        # UI E2E tests
├── libs/                    # Shared libraries
├── shared-constants/        # Shared constants and types
├── docs/                   # Documentation
└── tools/                  # Build tools and scripts
```

### Application Structure Guidelines

- Follow Nx conventions for project organization
- Keep related files close together
- Use feature-based folder structure within applications
- Separate concerns (components, services, types, etc.)

## TypeScript Standards

### Core Requirements

- **Always use TypeScript** - No JavaScript files should be added to the project
- Enable strict type checking in `tsconfig.json`
- Prefer explicit types over `any`
- Use type inference when the type is obvious
- Create interfaces for complex object structures

### Type Organization

- Define common types in the `shared-constants` library
- Use `const assertions` for readonly arrays that become types
- Export both constants and their derived types
- Create utility functions for common operations

### Import/Export Patterns

- Use **named exports** (avoid default exports)
- Re-export from index files for clean imports
- Use absolute imports with path mapping in `tsconfig.json`
- Group imports logically:
  1. React and core libraries
  2. Third-party libraries
  3. Internal APIs and utilities
  4. Internal components
  5. Shared constants and types
  6. Relative imports

## Code Formatting & Linting

### Prettier Configuration

- Single quotes for strings (configured in `.prettierrc`)
- 2-space indentation
- No trailing semicolons (Prettier default)
- Line length limit of 80-100 characters

### ESLint Configuration

- Use **ESLint** with TypeScript support
- Fix all linting errors before committing
- Use `@nx/eslint-plugin` for monorepo-specific rules
- Follow the configured rules in `eslint.config.js`

## Testing Standards

### Testing Framework Stack

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing (frontend)
- **Playwright**: End-to-end testing
- **Testing utilities**: Custom test helpers and fixtures

### Testing Guidelines

- Write tests for all public functions and components
- Test behavior, not implementation details
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Mock external dependencies appropriately
- Maintain good test coverage (aim for >80%)

### Test Organization

- Keep test files next to the code they test
- Use `.test.ts` or `.spec.ts` file extensions
- Create test utilities and fixtures for common setup
- Run E2E tests in CI/CD pipeline

### Test Structure Pattern

```typescript
describe('ComponentName', () => {
  it('should perform expected behavior when given valid input', () => {
    // Arrange - set up test data
    // Act - execute the function/component
    // Assert - verify the results
  });
});
```

## Documentation Standards

### Code Documentation

- Document complex business logic with comments
- Use JSDoc for public functions and APIs
- Document API endpoints with clear descriptions
- Keep README files up to date
- Document architectural decisions

### Type Documentation

```typescript
/**
 * Represents a tournament player with their statistics
 */
interface Player {
  /** Unique identifier for the player */
  id: string;
  /** Display name of the player */
  name: string;
  /** Player's win rate as a percentage (0-100) */
  winRate: number;
}
```

### API Documentation Requirements

- Document all API endpoints
- Include request/response examples
- Document authentication requirements
- Specify error conditions and responses
- Use consistent error response format:
  ```typescript
  {
    error: 'Error Type',
    message: 'User-friendly error message'
  }
  ```

## Enforcement

### Automated Tools

- **ESLint** for code quality
- **Prettier** for formatting
- **TypeScript compiler** for type safety
- **Husky** for pre-commit hooks

### Pre-commit Hooks

The project uses Husky to run checks before commits:

- Linting with ESLint
- Formatting with Prettier
- Type checking with TypeScript
- Running relevant tests

### Code Review Process

All code changes require review. Check adherence to:

- ✅ **Naming conventions** (components, functions, files)
- ✅ **Code organization** (imports, structure, separation of concerns)
- ✅ **Error handling** (try-catch, logging, response formats)
- ✅ **TypeScript usage** (proper typing, no `any`)
- ✅ **Testing coverage** (unit tests, integration tests)
- ✅ **Documentation** (JSDoc, inline comments where needed)

### Continuous Integration

- Run linting and formatting checks
- Execute all tests
- Build verification
- Security scans

## Implementation Details

For specific implementation patterns and detailed examples:

- **Frontend Development**: See [Frontend Patterns](./FRONTEND_PATTERNS.md)

  - React component patterns
  - Styled Components conventions
  - State management with RTK Query
  - Routing and navigation
  - Performance optimization

- **Backend Development**: See [Backend Patterns](./BACKEND_PATTERNS.md)
  - API architecture and layered design
  - Express route, controller, and service patterns
  - Database access with Prisma
  - Authentication and authorization
  - Error handling and logging

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Styled Components Documentation](https://styled-components.com/)
- [Nx Documentation](https://nx.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Testing Library Documentation](https://testing-library.com/)

## AI Assistant Guidelines

When working on this codebase:

1. Always reference these patterns documents
2. Follow the exact file/folder structure shown
3. Use the specific error handling and logging patterns
4. Maintain consistency with existing component/API patterns
