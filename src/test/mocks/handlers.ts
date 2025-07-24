import { http, HttpResponse } from 'msw'

// Mock Supabase API endpoints
export const handlers = [
  // Auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      },
    })
  }),

  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
      },
    })
  }),

  // Database endpoints
  http.get('*/rest/v1/quantumhealth_tenants', () => {
    return HttpResponse.json([
      {
        id: 'mock-tenant-id',
        name: 'QuantumHealth',
        slug: 'quantumhealth',
        domain: 'quantumhealth.quantum-climb.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        is_active: true,
        plan: 'enterprise',
      },
    ])
  }),

  http.get('*/rest/v1/quantumhealth_patient_profiles', () => {
    return HttpResponse.json([
      {
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
      },
    ])
  }),

  http.get('*/rest/v1/quantumhealth_doctor_profiles', () => {
    return HttpResponse.json([
      {
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
      },
    ])
  }),

  // Catch-all handler for unmatched requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`)
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),
] 