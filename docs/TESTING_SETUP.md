# QUANTUM HEALTH Testing Setup

This document outlines the comprehensive testing setup for the QUANTUM HEALTH project using **Vitest**, **React Testing Library**, and **MSW (Mock Service Worker)**.

## 🚀 Testing Stack

- **Vitest**: Fast unit test runner optimized for Vite
- **React Testing Library**: Testing utilities for React components
- **MSW**: API mocking for realistic testing scenarios
- **jsdom**: DOM environment for browser-like testing
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

## 📁 Testing Structure

```
src/
├── test/
│   ├── setup.ts              # Global test setup
│   ├── utils.tsx             # Test utilities and custom render
│   └── mocks/
│       ├── server.ts         # MSW server setup
│       └── handlers.ts       # API mock handlers
├── components/
│   └── __tests__/            # Component tests
├── services/
│   └── __tests__/            # Service tests
└── pages/
    └── __tests__/            # Page tests
```

## 🛠️ Available Scripts

```bash
# Run tests in watch mode (development)
npm run test

# Run tests with UI interface
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🧪 Writing Tests

### Component Testing

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Service Testing

```tsx
import { describe, it, expect, vi } from 'vitest'
import { authService } from '@/services/authService'

// Mock external dependencies
vi.mock('@supabase/supabase-js')

describe('AuthService', () => {
  it('should login user successfully', async () => {
    // Mock implementation
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: '123' } },
          error: null
        })
      }
    }
    
    // Test the service
    const result = await authService.loginUser({
      email: 'test@example.com',
      password: 'password123',
      role: 'patient'
    })
    
    expect(result).toBeDefined()
  })
})
```

### API Testing with MSW

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { rest } from 'msw'
import { server } from '@/test/mocks/server'
import { PatientList } from '@/components/PatientList'

describe('PatientList Component', () => {
  it('fetches and displays patients', async () => {
    // Override the default handler for this test
    server.use(
      rest.get('*/rest/v1/quantumhealth_patient_profiles', (req, res, ctx) => {
        return res(
          ctx.json([
            {
              id: '1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@example.com'
            }
          ])
        )
      })
    )

    render(<PatientList />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
```

## 🎯 Test Utilities

### Custom Render Function

The `@/test/utils` provides a custom render function that includes:

- **React Query Provider**: For testing components that use React Query
- **React Router**: For testing components that use routing
- **Custom Providers**: Any other context providers your app needs

### Mock Data Factories

```tsx
import { createMockPatient, createMockDoctor, createMockTenant } from '@/test/utils'

// Use in tests
const patient = createMockPatient({ first_name: 'Custom Name' })
const doctor = createMockDoctor({ specialization: 'Neurology' })
const tenant = createMockTenant({ name: 'Custom Clinic' })
```

## 🔧 Configuration

### Vitest Config (`vitest.config.ts`)

```ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### Test Setup (`src/test/setup.ts`)

- Configures MSW server
- Sets up global mocks (IntersectionObserver, ResizeObserver, etc.)
- Configures console error/warning filtering
- Sets up testing environment

## 📊 Coverage Reports

Run `npm run test:coverage` to generate coverage reports:

- **Text**: Console output
- **JSON**: Machine-readable format
- **HTML**: Interactive web report

Coverage includes:
- Statements
- Branches
- Functions
- Lines

## 🎭 Mocking Strategies

### 1. Component Props Mocking

```tsx
const mockProps = {
  onSave: vi.fn(),
  data: createMockPatient(),
  isLoading: false
}

render(<PatientForm {...mockProps} />)
```

### 2. API Response Mocking

```tsx
// In handlers.ts
http.get('*/rest/v1/quantumhealth_patient_profiles', () => {
  return HttpResponse.json([
    createMockPatient(),
    createMockPatient({ first_name: 'Jane' })
  ])
})
```

### 3. External Library Mocking

```tsx
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { signInWithPassword: vi.fn() },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis()
    }))
  }))
}))
```

## 🚨 Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Component Testing
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility features

### 3. Service Testing
- Mock external dependencies
- Test error scenarios
- Verify correct function calls

### 4. API Testing
- Use MSW for realistic API mocking
- Test loading states
- Test error handling

## 🔍 Debugging Tests

### Using Vitest UI

```bash
npm run test:ui
```

Provides an interactive interface for:
- Running specific tests
- Viewing test results
- Debugging failed tests

### Console Logging

```tsx
it('should work', () => {
  console.log('Debug info')
  // Test code
})
```

### Debug Mode

```bash
# Run specific test file in debug mode
npm run test -- --reporter=verbose src/components/__tests__/MyComponent.test.tsx
```

## 📈 Continuous Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 🎯 Testing Checklist

- [ ] Unit tests for utility functions
- [ ] Component tests for UI components
- [ ] Service tests for business logic
- [ ] Integration tests for user flows
- [ ] API tests with MSW
- [ ] Error handling tests
- [ ] Accessibility tests
- [ ] Performance tests (if needed)

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

This testing setup provides a solid foundation for maintaining code quality and ensuring your QUANTUM HEALTH application works reliably across all features and user interactions. 