# Contributing to Inventory Management System

Thank you for your interest in contributing to the Inventory Management System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone. We expect all contributors to:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Be collaborative and open to feedback
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or inflammatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct that is unprofessional or unwelcome

### Enforcement

Violations of the Code of Conduct may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to the project maintainers.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment**
   - Node.js 18+ and npm 9+
   - Git
   - Docker Desktop (optional but recommended)
   - VS Code (recommended) with suggested extensions

2. **Knowledge**
   - TypeScript
   - React and Next.js
   - Node.js and Express
   - MongoDB basics
   - Git workflow

3. **Accounts**
   - GitHub account
   - MongoDB Atlas account (for cloud testing, optional)

### Initial Setup

1. **Fork the Repository**
   ```bash
   # Click 'Fork' button on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/inventory-management.git
   cd inventory-management
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/inventory-management.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Database**
   ```bash
   npm run db:up
   ```

6. **Run the Application**
   ```bash
   npm run dev
   ```

7. **Verify Setup**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api
   - All tests passing: `npm run test`

## Development Workflow

### 1. Find or Create an Issue

- Check [existing issues](https://github.com/your-repo/issues)
- Comment on the issue to claim it
- For new features, discuss in an issue first
- For small fixes, you can skip this step

### 2. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Conventions:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates
- `chore/description` - Maintenance tasks

### 3. Make Your Changes

- Write clean, readable code
- Follow coding standards (see below)
- Add tests for new functionality
- Update documentation as needed
- Keep commits small and focused

### 4. Test Your Changes

```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Check TypeScript types
npm run type-check

# Format code
npm run format

# Test in browser
npm run dev
```

### 5. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add product search functionality"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Fill in the PR template
4. Link related issues
5. Submit the PR

## Coding Standards

### TypeScript

```typescript
// Use interfaces for object shapes
interface Product {
  id: string;
  name: string;
  price: number;
}

// Use types for unions, intersections, etc.
type Status = 'active' | 'inactive' | 'discontinued';

// Use explicit return types for functions
function calculateTotal(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Use optional chaining and nullish coalescing
const productName = product?.name ?? 'Unknown';

// Avoid 'any' type
// Bad
function process(data: any) { }

// Good
function process(data: unknown) { }
```

### React Components

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// Use proper hooks
import { useState, useEffect, useCallback } from 'react';

// Memoize callbacks when passed to children
const handleClick = useCallback(() => {
  // handle click
}, [dependencies]);
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── layouts/         # Layout components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── stores/              # State management
├── types/               # TypeScript types
└── app/                 # Next.js app directory
```

### Naming Conventions

- **Files**: `kebab-case.tsx` (e.g., `product-list.tsx`)
- **Components**: `PascalCase` (e.g., `ProductList`)
- **Functions**: `camelCase` (e.g., `calculateTotal`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Interfaces**: `PascalCase` (e.g., `ProductInterface`)
- **Types**: `PascalCase` (e.g., `StatusType`)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Max line length: 100 characters
- Use trailing commas in objects/arrays
- Use arrow functions for callbacks

**Good:**
```typescript
const products = [
  { id: 1, name: 'Product 1' },
  { id: 2, name: 'Product 2' },
];

const processProduct = (product: Product): ProcessedProduct => {
  return { ...product, processed: true };
};
```

### Comments

```typescript
// Good: Explain WHY, not WHAT
// Calculate discount based on loyalty tier
// Gold members get 20% off, Silver get 10%
const discount = calculateDiscount(user.tier);

// Bad: Obvious comment
// Loop through products
products.forEach((product) => {
  // ...
});

// Use JSDoc for public functions
/**
 * Calculates the total price including tax
 * @param price - Base price of the product
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price with tax
 */
function calculateTotalWithTax(price: number, taxRate: number): number {
  return price * (1 + taxRate);
}
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring (no functional changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)
- **ci**: CI/CD changes

### Examples

```bash
# Simple commit
git commit -m "feat: add product search functionality"

# With scope
git commit -m "fix(api): resolve authentication timeout issue"

# With body and breaking change
git commit -m "feat(products): add bulk import feature

Allow users to import multiple products via CSV file.
Includes validation and error handling.

BREAKING CHANGE: Changes the product API endpoint structure."

# Multiple changes (avoid if possible)
git commit -m "chore: update dependencies and fix linting issues"
```

### Commit Best Practices

- **Keep commits atomic**: One logical change per commit
- **Write descriptive messages**: Explain what and why, not how
- **Reference issues**: Use `Fixes #123` or `Closes #456`
- **Present tense**: Use "add" not "added"
- **Imperative mood**: Use "fix" not "fixes"
- **No period**: Don't end subject line with a period
- **Limit line length**: 50 chars for subject, 72 for body

## Pull Request Process

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows coding standards
- [ ] All tests pass (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Commit messages follow guidelines
- [ ] PR description is clear and complete
- [ ] Related issues are linked

### PR Title

Use the same format as commit messages:

```
feat: add product search functionality
fix: resolve authentication timeout
docs: update setup instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Closes #456

## Changes Made
- List key changes
- Explain decisions
- Note any trade-offs

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Tested manually in browser
- [ ] All tests passing

## Screenshots
[If applicable, add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Linting and type checking
   - Build verification

2. **Code Review**
   - At least one approval required
   - Address all review comments
   - Maintain respectful discussion

3. **Revisions**
   - Make requested changes
   - Push new commits to same branch
   - Request re-review when ready

4. **Merge**
   - Maintainer will merge when approved
   - Branch will be deleted automatically
   - Issue will be closed automatically (if linked)

### Review Guidelines

**For Authors:**
- Respond to all comments
- Be open to feedback
- Explain your reasoning
- Keep discussion focused

**For Reviewers:**
- Be constructive and kind
- Explain the "why" behind suggestions
- Approve when satisfied
- Request changes if needed

## Testing Requirements

### Test Coverage

- Aim for 80%+ code coverage
- 100% coverage for critical paths
- Test both success and error cases
- Test edge cases

### Types of Tests

#### Unit Tests

```typescript
// Example unit test
describe('calculateTotal', () => {
  it('should calculate total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(35);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should handle negative prices', () => {
    const items = [{ price: -10, quantity: 1 }];
    expect(calculateTotal(items)).toBe(-10);
  });
});
```

#### Integration Tests

```typescript
// Example API test
describe('POST /api/products', () => {
  it('should create a new product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({
        name: 'Test Product',
        price: 99.99,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Product');
  });
});
```

#### Component Tests

```typescript
// Example React component test
describe('ProductCard', () => {
  it('should render product information', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 99.99,
    };

    render(<ProductCard product={product} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- product.test.ts

# Run tests for specific workspace
npm run test --workspace=frontend
```

## Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change existing behavior
- Add new configuration options
- Modify API endpoints
- Change environment variables
- Update dependencies

### Documentation Locations

- **README.md**: Overview and quick start
- **SETUP.md**: Detailed installation instructions
- **FEATURES.md**: Feature list and descriptions
- **TECH_STACK.md**: Technology choices
- **API Documentation**: In-code JSDoc comments
- **Code Comments**: For complex logic

### Writing Good Documentation

- **Be Clear**: Use simple, direct language
- **Be Concise**: Get to the point quickly
- **Use Examples**: Show, don't just tell
- **Keep Updated**: Update docs with code changes
- **Check Links**: Ensure all links work
- **Use Markdown**: Format consistently

## Issue Guidelines

### Creating Issues

#### Bug Reports

```markdown
**Describe the Bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Safari]
- Version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information
```

#### Feature Requests

```markdown
**Feature Description**
Clear description of the feature

**Problem it Solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought of

**Additional Context**
Screenshots, mockups, etc.
```

### Issue Labels

- `bug`: Something isn't working
- `feature`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `enhancement`: Improvement to existing feature
- `question`: Further information requested
- `wontfix`: Won't be fixed
- `duplicate`: Duplicate of another issue

## Community

### Getting Help

- **Documentation**: Check README and SETUP docs
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Discord**: Join our Discord server (if available)

### Staying Updated

- Watch the repository for notifications
- Follow release notes in CHANGELOG.md
- Join community discussions
- Subscribe to release notifications

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in commit messages
- Recognized in README (for major contributions)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [MongoDB Manual](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## Questions?

If you have questions not covered in this guide:
1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Create a new issue with the "question" label

---

Thank you for contributing to the Inventory Management System! Your efforts help make this project better for everyone.
