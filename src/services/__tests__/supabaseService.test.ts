import { describe, it, expect, vi, beforeEach } from 'vitest'
import { multiTenantService } from '@/services/supabaseService'
import { createMockPatient, createMockDoctor, createMockTenant } from '@/test/utils'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ne: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
  }

  return {
    createClient: vi.fn(() => mockSupabase),
  }
})

describe('SupabaseService', () => {
  let mockSupabase: ReturnType<typeof createClient>

  beforeEach(() => {
    vi.clearAllMocks()
    // Get the mocked instance
    mockSupabase = createClient('test-url', 'test-key')
  })

  describe('setTenantContext', () => {
    it('should set tenant context successfully', async () => {
      const mockTenant = createMockTenant()
      
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: mockTenant,
        error: null,
      })

      const result = await multiTenantService.setTenantContext('quantumhealth')

      expect(result).toEqual(mockTenant)
      expect(mockSupabase.from).toHaveBeenCalledWith('quantumhealth_tenants')
    })

    it('should return null when tenant not found', async () => {
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const result = await multiTenantService.setTenantContext('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getPatients', () => {
    it('should fetch patients successfully', async () => {
      const mockPatients = [createMockPatient()]
      
      mockSupabase.from().select().eq().mockResolvedValue({
        data: mockPatients,
        error: null,
      })

      const result = await multiTenantService.getPatients()

      expect(result).toEqual(mockPatients)
      expect(mockSupabase.from).toHaveBeenCalledWith('quantumhealth_patient_profiles')
    })

    it('should handle errors when fetching patients', async () => {
      mockSupabase.from().select().eq().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const result = await multiTenantService.getPatients()

      expect(result).toEqual([])
    })
  })

  describe('getDoctors', () => {
    it('should fetch doctors successfully', async () => {
      const mockDoctors = [createMockDoctor()]
      
      mockSupabase.from().select().eq().mockResolvedValue({
        data: mockDoctors,
        error: null,
      })

      const result = await multiTenantService.getDoctors()

      expect(result).toEqual(mockDoctors)
      expect(mockSupabase.from).toHaveBeenCalledWith('quantumhealth_doctor_profiles')
    })

    it('should handle errors when fetching doctors', async () => {
      mockSupabase.from().select().eq().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const result = await multiTenantService.getDoctors()

      expect(result).toEqual([])
    })
  })

  describe('getMedicalReports', () => {
    it('should fetch medical reports successfully', async () => {
      const mockReports = [
        {
          id: 'report-1',
          patient_id: 'patient-1',
          doctor_id: 'doctor-1',
          report_type: 'lab',
          report_name: 'Blood Test',
          category: 'Laboratory',
          status: 'reviewed',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      ]
      
      mockSupabase.from().select().eq().mockResolvedValue({
        data: mockReports,
        error: null,
      })

      const result = await multiTenantService.getMedicalReports()

      expect(result).toEqual(mockReports)
      expect(mockSupabase.from).toHaveBeenCalledWith('quantumhealth_medical_reports')
    })
  })

  describe('getAppointments', () => {
    it('should fetch appointments successfully', async () => {
      const mockAppointments = [
        {
          id: 'appointment-1',
          patient_id: 'patient-1',
          doctor_id: 'doctor-1',
          appointment_date: '2024-01-01T10:00:00Z',
          appointment_time: '10:00:00',
          duration_minutes: 30,
          status: 'scheduled',
          notes: 'Regular checkup',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      ]
      
      mockSupabase.from().select().eq().mockResolvedValue({
        data: mockAppointments,
        error: null,
      })

      const result = await multiTenantService.getAppointments()

      expect(result).toEqual(mockAppointments)
      expect(mockSupabase.from).toHaveBeenCalledWith('quantumhealth_appointments')
    })
  })

  describe('createPatient', () => {
    it('should create patient successfully', async () => {
      const mockPatient = createMockPatient()
      const patientData = {
        user_id: 'user-1',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        phone: '+1234567890',
      }
      
      mockSupabase.from().insert().mockResolvedValue({
        data: [mockPatient],
        error: null,
      })

      const result = await multiTenantService.createPatient(patientData)

      expect(result).toEqual(mockPatient)
      expect(mockSupabase.from).toHaveBeenCalledWith('quantumhealth_patient_profiles')
    })

    it('should handle errors when creating patient', async () => {
      const patientData = {
        user_id: 'user-1',
        first_name: 'John',
        last_name: 'Doe',
      }
      
      mockSupabase.from().insert().mockResolvedValue({
        data: null,
        error: { message: 'Validation error' },
      })

      const result = await multiTenantService.createPatient(patientData)

      expect(result).toBeNull()
    })
  })

  describe('createDoctor', () => {
    it('should create doctor successfully', async () => {
      const mockDoctor = createMockDoctor()
      const doctorData = {
        user_id: 'user-1',
        first_name: 'Dr. Jane',
        last_name: 'Smith',
        specialization: 'Cardiology',
        license_number: 'MD123456',
        clinic_name: 'Heart Clinic',
      }
      
      mockSupabase.from().insert().mockResolvedValue({
        data: [mockDoctor],
        error: null,
      })

      const result = await multiTenantService.createDoctor(doctorData)

      expect(result).toEqual(mockDoctor)
      expect(mockSupabase.from).toHaveBeenCalledWith('quantumhealth_doctor_profiles')
    })
  })
}) 