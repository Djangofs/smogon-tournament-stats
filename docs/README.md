# Documentation

Welcome to the Smogon Tournament Stats project documentation. This folder contains comprehensive guides and standards for contributing to the project.

## 📚 Available Documentation

### [Coding Standards](./CODING_STANDARDS.md)

**The main reference for all development work on this project.**

This document provides:

- General code quality guidelines
- TypeScript usage patterns
- Project structure conventions
- Testing standards
- Documentation requirements
- Enforcement guidelines

**Start here** if you're new to the project or need a quick reference for coding standards.

### [Frontend Patterns](./FRONTEND_PATTERNS.md)

**Detailed patterns for React/TypeScript frontend development.**

Covers:

- Component organization and naming
- Styled Components patterns
- State management with RTK Query
- Routing and navigation
- Error handling
- Performance optimization
- Testing strategies

**Use this** when developing or reviewing frontend code in the `stats-ui` application.

### [Backend Patterns](./BACKEND_PATTERNS.md)

**Comprehensive guide for Node.js/Express backend development.**

Includes:

- API architecture and layered design
- Route, controller, and service patterns
- Database access with Prisma
- Authentication and authorization
- Error handling and logging
- Configuration management
- Testing approaches

**Reference this** when working on the `stats-api` application or any backend services.

## 🚀 Getting Started

### For New Contributors

1. **Read the [Coding Standards](./CODING_STANDARDS.md)** first to understand the overall approach
2. **Choose your focus area:**
   - Frontend work? → [Frontend Patterns](./FRONTEND_PATTERNS.md)
   - Backend work? → [Backend Patterns](./BACKEND_PATTERNS.md)
   - Full-stack? → Read both pattern documents
3. **Set up your development environment** following the main project README
4. **Review existing code** to see these patterns in action

### For Code Reviews

When reviewing pull requests, check adherence to:

- ✅ **Naming conventions** (components, functions, files)
- ✅ **Code organization** (imports, structure, separation of concerns)
- ✅ **Error handling** (try-catch, logging, response formats)
- ✅ **TypeScript usage** (proper typing, no `any`)
- ✅ **Testing coverage** (unit tests, integration tests)
- ✅ **Documentation** (JSDoc, inline comments where needed)

## 🔧 Development Tools

### Required Tools

- **ESLint**: Enforces code quality rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Type checking and compilation
- **Jest**: Unit and integration testing
- **Playwright**: End-to-end testing

### Pre-commit Hooks

The project uses Husky to run checks before commits:

- Linting with ESLint
- Formatting with Prettier
- Type checking with TypeScript
- Running relevant tests

## 📁 Project Structure

```
smogon-tournament-stats/
├── apps/
│   ├── stats-api/          # Backend Express API
│   ├── stats-ui/           # Frontend React app
│   ├── stats-api-e2e/     # API E2E tests
│   └── stats-ui-e2e/      # UI E2E tests
├── shared-constants/       # Shared types and constants
├── docs/                  # This documentation
│   ├── README.md          # This file
│   ├── CODING_STANDARDS.md
│   ├── FRONTEND_PATTERNS.md
│   └── BACKEND_PATTERNS.md
└── [configuration files]
```

## 🎯 Key Principles

### Code Quality

- **Self-documenting code** with clear, descriptive names
- **Single Responsibility Principle** for functions and components
- **Type safety** with TypeScript throughout
- **Consistent error handling** and logging

### Architecture

- **Separation of concerns** between layers
- **Domain-driven organization** for backend APIs
- **Component-based architecture** for frontend
- **Shared code** in dedicated libraries

### Testing

- **Test-driven development** where appropriate
- **Comprehensive test coverage** (>80% target)
- **End-to-end testing** for critical user journeys
- **Mock external dependencies** in unit tests

### Documentation

- **Code comments** for complex business logic
- **API documentation** for all endpoints
- **Type documentation** with JSDoc
- **Up-to-date README files**

## 🤝 Contributing

### Before You Start

1. **Read the relevant documentation** (this folder)
2. **Set up your development environment**
3. **Run the existing tests** to ensure everything works
4. **Check the project board** for available tasks

### Making Changes

1. **Create a feature branch** from `main`
2. **Follow the coding standards** outlined in these docs
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### Pull Request Guidelines

- **Descriptive title** and description
- **Link to relevant issues** or tasks
- **Include screenshots** for UI changes
- **Ensure all checks pass** (linting, tests, builds)
- **Request review** from appropriate team members

## 📈 Continuous Improvement

These documentation standards are living documents that should evolve with the project:

- **Suggest improvements** if you find gaps or unclear sections
- **Update patterns** when introducing new technologies or approaches
- **Add examples** from real code when helpful
- **Keep documentation current** with code changes

## 🆘 Getting Help

If you have questions about these standards or patterns:

1. **Check the specific pattern document** for detailed examples
2. **Look at existing code** in the repository for real implementations
3. **Ask in pull request reviews** for clarification
4. **Suggest documentation improvements** if something is unclear

## 📝 Quick Reference

### TypeScript

- Always use TypeScript (no `.js` files)
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Export types alongside implementations

### Testing

- Unit tests: `.test.ts` or `.spec.ts`
- Place tests next to the code they test
- Use descriptive test names
- Test behavior, not implementation

### Git

- Use conventional commit messages
- Keep commits focused and atomic
- Include relevant issue numbers
- Write clear pull request descriptions

---

**Remember**: These standards exist to help us build maintainable, consistent, and high-quality software. When in doubt, favor clarity and simplicity over complexity.
