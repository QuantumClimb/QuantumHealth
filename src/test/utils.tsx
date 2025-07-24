import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Test data factories
export const createMockPatient = (overrides = {}) => ({
  id: 'mock-patient-id',
  user_id: 'mock-user-id',
  tenant_id: 'mock-tenant-id',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-01',
  phone: '+1234567890',
  address: '123 Main St',
  emergency_contact: 'Jane Doe',
  emergency_phone: '+1234567891',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockDoctor = (overrides = {}) => ({
  id: 'mock-doctor-id',
  user_id: 'mock-user-id',
  tenant_id: 'mock-tenant-id',
  first_name: 'Dr. Jane',
  last_name: 'Smith',
  specialization: 'Cardiology',
  license_number: 'MD123456',
  phone: '+1234567890',
  clinic_id: 'CLINIC123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockTenant = (overrides = {}) => ({
  id: 'mock-tenant-id',
  name: 'QuantumHealth',
  slug: 'quantumhealth',
  domain: 'quantumhealth.quantum-climb.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_active: true,
  plan: 'enterprise',
  ...overrides,
})

// Helper function to render without Router (for components that don't need routing)
export const renderWithoutRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
} 