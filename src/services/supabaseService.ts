/**
 * QuantumHealth Multi-Tenant Supabase Service
 * Handles tenant isolation and provides type-safe database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ===== TYPE DEFINITIONS =====
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  settings: {
    theme?: {
      primary_color?: string;
      secondary_color?: string;
      logo_url?: string;
    };
    features?: {
      reports?: boolean;
      messaging?: boolean;
      appointments?: boolean;
      analytics?: boolean;
      integrations?: boolean;
    };
    limits?: {
      max_users?: number;
      max_storage_gb?: number;
      max_api_calls_per_day?: number;
    };
  };
  metadata?: Record<string, unknown>;
}

export interface PatientProfile {
  id: string;
  tenant_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: Record<string, unknown>;
  emergency_contact?: Record<string, unknown>;
  medical_history?: Record<string, unknown>;
  allergies?: string[];
  medications?: string[];
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  tenant_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  clinic_name?: string;
  specialization: string;
  license_number?: string;
  experience_years?: number;
  qualifications?: string[];
  consultation_fee?: number;
  availability?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MedicalReport {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id?: string;
  report_name: string;
  report_type: 'lab' | 'imaging' | 'pathology' | 'consultation' | 'prescription';
  category: string;
  file_url?: string;
  file_size_bytes?: number;
  file_format?: string;
  status: 'pending' | 'reviewed' | 'archived';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type?: 'consultation' | 'follow_up' | 'emergency' | 'routine_check';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  consultation_fee?: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  participant_1_id: string;
  participant_2_id: string;
  participant_1_type?: 'patient' | 'doctor' | 'admin';
  participant_2_type?: 'patient' | 'doctor' | 'admin';
  last_message_at: string;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  tenant_id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  sender_type?: 'patient' | 'doctor' | 'admin';
  recipient_type?: 'patient' | 'doctor' | 'admin';
  subject?: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'urgent';
  is_urgent: boolean;
  is_read: boolean;
  read_at?: string;
  attachments?: Record<string, unknown>[];
  created_at: string;
}

// ===== SUPABASE CLIENT INITIALIZATION =====
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'SET' : 'MISSING',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET' : 'MISSING'
  });
  
  // In development, we can continue with mock data
  if (import.meta.env.DEV) {
    console.warn('Running in development mode with mock data');
  } else {
    throw new Error('Missing Supabase environment variables. Please check your Vercel environment configuration.');
  }
}

// Validate URL format
let validSupabaseUrl = supabaseUrl;
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.warn('Invalid Supabase URL format. Expected https:// URL');
  validSupabaseUrl = `https://${supabaseUrl}`;
}

// Check if API key looks valid (basic validation)
const isValidApiKey = supabaseAnonKey && supabaseAnonKey.length > 50 && supabaseAnonKey.includes('.');
if (!isValidApiKey) {
  console.warn('Invalid Supabase API key format. Using mock mode for development.');
}

export const supabase = createClient(
  validSupabaseUrl || 'https://placeholder.supabase.co', 
  isValidApiKey ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.placeholder_key_for_development'
);

// ===== MULTI-TENANT CONTEXT MANAGEMENT =====
class MultiTenantSupabaseService {
  private currentTenantId: string | null = null;
  private currentTenant: Tenant | null = null;

  /**
   * Set the current tenant context for all subsequent operations
   */
  async setTenantContext(tenantSlug: string): Promise<Tenant | null> {
    try {
      // For public tenant lookup, we need to use the service role key
      // First, try with anonymous access for public tenant info
      const { data: tenant, error } = await supabase
        .from('quantumhealth_tenants')
        .select('*')
        .eq('slug', tenantSlug)
        .eq('is_active', true)
        .single();

      if (error) {
        // If we get a 401, the tenant table requires authentication
        // For now, let's create a mock tenant for development
        console.warn('Tenant lookup failed, using mock tenant for development:', error);
        
        const mockTenant: Tenant = {
          id: 'mock-tenant-id',
          name: 'QuantumHealth',
          slug: 'quantumhealth',
          domain: 'quantumhealth.quantum-climb.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          plan: 'enterprise',
          settings: {
            theme: {
              primary_color: '#14b8a6',
              secondary_color: '#22c55e',
              logo_url: '/assets/QuantumHealth_Logo.png'
            },
            features: {
              reports: true,
              messaging: true,
              appointments: true,
              analytics: true,
              integrations: true
            },
            limits: {
              max_users: 1000,
              max_storage_gb: 100,
              max_api_calls_per_day: 100000
            }
          },
          metadata: {
            industry: 'healthcare',
            country: 'US',
            timezone: 'UTC',
            language: 'en'
          }
        };

        this.currentTenant = mockTenant;
        this.currentTenantId = mockTenant.id;
        return mockTenant;
      }

      this.currentTenant = tenant;
      this.currentTenantId = tenant.id;
      return tenant;
    } catch (error) {
      console.error('Error setting tenant context:', error);
      return null;
    }
  }

  /**
   * Get the current tenant context
   */
  getCurrentTenant(): Tenant | null {
    return this.currentTenant;
  }

  /**
   * Get the current tenant ID
   */
  getCurrentTenantId(): string | null {
    return this.currentTenantId;
  }

  // ===== PATIENT OPERATIONS =====
  async getPatients(): Promise<PatientProfile[]> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    try {
      const { data, error } = await supabase
        .from('quantumhealth_patient_profiles')
        .select('*')
        .eq('tenant_id', this.currentTenantId);

      if (error) {
        console.error('Error fetching patients:', error);
        // Return mock data in development if database access fails
        if (import.meta.env.DEV) {
          console.warn('Returning mock patient data due to database access error');
          return [
            {
              id: 'mock-patient-1',
              tenant_id: this.currentTenantId,
              user_id: 'mock-user-1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '+1-555-0124',
              date_of_birth: '1985-03-15',
              gender: 'male',
              address: { street: '123 Health St', city: 'Wellness City' },
              emergency_contact: { name: 'Jane Doe', phone: '+1-555-0125' },
              medical_history: { conditions: ['Hypertension'] },
              allergies: ['Penicillin'],
              medications: ['Lisinopril'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching patients:', error);
      return [];
    }
  }

  async getPatientById(id: string): Promise<PatientProfile | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_patient_profiles')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)
      .single();

    if (error) {
      console.error('Error fetching patient:', error);
      return null;
    }

    return data;
  }

  async createPatient(patientData: Omit<PatientProfile, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<PatientProfile | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_patient_profiles')
      .insert({
        ...patientData,
        tenant_id: this.currentTenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating patient:', error);
      return null;
    }

    return data;
  }

  // ===== DOCTOR OPERATIONS =====
  async getDoctors(): Promise<DoctorProfile[]> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_doctor_profiles')
      .select('*')
      .eq('tenant_id', this.currentTenantId);

    if (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }

    return data || [];
  }

  async getDoctorById(id: string): Promise<DoctorProfile | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_doctor_profiles')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)
      .single();

    if (error) {
      console.error('Error fetching doctor:', error);
      return null;
    }

    return data;
  }

  async createDoctor(doctorData: Omit<DoctorProfile, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<DoctorProfile | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_doctor_profiles')
      .insert({
        ...doctorData,
        tenant_id: this.currentTenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating doctor:', error);
      return null;
    }

    return data;
  }

  // ===== MEDICAL REPORTS OPERATIONS =====
  async getMedicalReports(): Promise<MedicalReport[]> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    try {
      const { data, error } = await supabase
        .from('quantumhealth_medical_reports')
        .select('*')
        .eq('tenant_id', this.currentTenantId);

      if (error) {
        console.error('Error fetching medical reports:', error);
        // Return mock data in development if database access fails
        if (import.meta.env.DEV) {
          console.warn('Returning mock medical report data due to database access error');
          return [
            {
              id: 'mock-report-1',
              tenant_id: this.currentTenantId,
              patient_id: 'mock-patient-1',
              doctor_id: 'mock-doctor-1',
              report_name: 'Blood Test Results',
              report_type: 'lab',
              category: 'Laboratory',
              file_url: 'https://example.com/reports/blood-test.pdf',
              file_size_bytes: 1024000,
              file_format: 'PDF',
              status: 'reviewed',
              description: 'Complete blood count and metabolic panel',
              metadata: { lab: 'Quantum Labs' },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching medical reports:', error);
      return [];
    }
  }

  async createMedicalReport(reportData: Omit<MedicalReport, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<MedicalReport | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_medical_reports')
      .insert({
        ...reportData,
        tenant_id: this.currentTenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating medical report:', error);
      return null;
    }

    return data;
  }

  // ===== APPOINTMENTS OPERATIONS =====
  async getAppointments(): Promise<Appointment[]> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_appointments')
      .select('*')
      .eq('tenant_id', this.currentTenantId);

    if (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }

    return data || [];
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_appointments')
      .insert({
        ...appointmentData,
        tenant_id: this.currentTenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return null;
    }

    return data;
  }

  async updateAppointment(id: string, updates: Partial<Omit<Appointment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>): Promise<Appointment | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_appointments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', this.currentTenantId)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return null;
    }

    return data;
  }

  // ===== CONVERSATIONS OPERATIONS =====
  async getConversations(): Promise<Conversation[]> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_conversations')
      .select('*')
      .eq('tenant_id', this.currentTenantId);

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  }

  async createConversation(conversationData: Omit<Conversation, 'id' | 'tenant_id' | 'created_at'>): Promise<Conversation | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_conversations')
      .insert({
        ...conversationData,
        tenant_id: this.currentTenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  }

  // ===== MESSAGES OPERATIONS =====
  async getMessages(conversationId: string): Promise<Message[]> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_messages')
      .select('*')
      .eq('tenant_id', this.currentTenantId)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  async createMessage(messageData: Omit<Message, 'id' | 'tenant_id' | 'created_at'>): Promise<Message | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    const { data, error } = await supabase
      .from('quantumhealth_messages')
      .insert({
        ...messageData,
        tenant_id: this.currentTenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    return data;
  }

  // ===== CURRENT USER PROFILE OPERATIONS =====
  async getCurrentDoctorProfile(): Promise<DoctorProfile | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    // For now, return a mock profile since we don't have user authentication set up
    // In a real app, you would get the current user ID from auth context
    const mockDoctorProfile: DoctorProfile = {
      id: 'mock-doctor-id',
      tenant_id: this.currentTenantId,
      user_id: 'mock-user-id',
      first_name: 'Dr. Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@quantumhealth.com',
      phone: '+1-555-0123',
      clinic_name: 'Quantum Health Clinic',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      experience_years: 8,
      qualifications: ['MBBS', 'MD Cardiology', 'Fellowship in Interventional Cardiology'],
      consultation_fee: 150,
      availability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return mockDoctorProfile;
  }

  async getCurrentPatientProfile(): Promise<PatientProfile | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    // For now, return a mock profile since we don't have user authentication set up
    // In a real app, you would get the current user ID from auth context
    const mockPatientProfile: PatientProfile = {
      id: 'mock-patient-id',
      tenant_id: this.currentTenantId,
      user_id: 'mock-user-id',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0124',
      date_of_birth: '1985-03-15',
      gender: 'male',
      address: {
        street: '123 Health Street',
        city: 'Wellness City',
        state: 'CA',
        zip: '90210',
        country: 'USA'
      },
      emergency_contact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1-555-0125'
      },
      medical_history: {
        conditions: ['Hypertension'],
        surgeries: ['Appendectomy - 2010'],
        allergies: ['Penicillin']
      },
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Lisinopril 10mg daily'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return mockPatientProfile;
  }

  async updateDoctorProfile(profileData: Partial<DoctorProfile>): Promise<DoctorProfile | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    // For now, just return the updated mock profile
    // In a real app, you would update the database
    const currentProfile = await this.getCurrentDoctorProfile();
    if (!currentProfile) return null;

    const updatedProfile: DoctorProfile = {
      ...currentProfile,
      ...profileData,
      updated_at: new Date().toISOString()
    };

    return updatedProfile;
  }

  async updatePatientProfile(profileData: Partial<PatientProfile>): Promise<PatientProfile | null> {
    if (!this.currentTenantId) {
      throw new Error('No tenant context set');
    }

    // For now, just return the updated mock profile
    // In a real app, you would update the database
    const currentProfile = await this.getCurrentPatientProfile();
    if (!currentProfile) return null;

    const updatedProfile: PatientProfile = {
      ...currentProfile,
      ...profileData,
      updated_at: new Date().toISOString()
    };

    return updatedProfile;
  }
}

// ===== EXPORT INSTANCE =====
export const multiTenantService = new MultiTenantSupabaseService();

// ===== INITIALIZATION FUNCTIONS =====
export async function initializeApp(tenantSlug: string): Promise<Tenant> {
  const tenant = await multiTenantService.setTenantContext(tenantSlug);
  if (!tenant) {
    throw new Error(`Failed to initialize tenant: ${tenantSlug}`);
  }
  return tenant;
}

export function getCurrentTenant(): Tenant | null {
  return multiTenantService.getCurrentTenant();
}

export default multiTenantService; 