/**
 * QUANTUM HEALTH Authentication Service
 * Handles user authentication, registration, and session management
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { multiTenantService } from './supabaseService';

// ===== TYPE DEFINITIONS =====

export interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  tenant_id: string;
  profile: PatientProfile | DoctorProfile | null;
  session?: Session;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  clinic_id?: string; // For doctors
}

export interface RegisterCredentials {
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  profile: PatientRegistrationData | DoctorRegistrationData;
}

export interface PatientRegistrationData {
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  emergency_contact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  medical_history?: Record<string, unknown>;
  allergies?: string[];
  medications?: string[];
}

export interface DoctorRegistrationData {
  first_name: string;
  last_name: string;
  phone?: string;
  clinic_name?: string;
  specialization: string;
  license_number?: string;
  experience_years?: number;
  qualifications?: string[];
  consultation_fee?: number;
  availability?: Record<string, unknown>;
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

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

// ===== AUTHENTICATION SERVICE =====

class AuthService {
  private supabase: SupabaseClient;
  private currentUser: AuthUser | null = null;
  private currentSession: Session | null = null;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    // Initialize session from storage
    this.initializeSession();
  }

  // ===== SESSION MANAGEMENT =====

  private async initializeSession(): Promise<void> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session) {
        this.currentSession = session;
        await this.loadCurrentUser();
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }

  private async loadCurrentUser(): Promise<void> {
    if (!this.currentSession?.user) return;

    try {
      const user = await this.getUserWithProfile(this.currentSession.user.id);
      if (user) {
        this.currentUser = user;
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  }

  // ===== USER REGISTRATION =====

  async registerUser(credentials: RegisterCredentials): Promise<AuthUser | null> {
    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // 2. Get current tenant context
      const tenant = multiTenantService.getCurrentTenant();
      if (!tenant) {
        throw new Error('No tenant context available');
      }

      // 3. Create user role
      const { error: roleError } = await this.supabase
        .from('quantumhealth_user_roles')
        .insert({
          user_id: authData.user.id,
          tenant_id: tenant.id,
          role_type: credentials.role,
          is_active: true
        });

      if (roleError) {
        // Clean up auth user if role creation fails
        await this.supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error('Failed to assign user role');
      }

      // 4. Create user profile
      const profileData = {
        ...credentials.profile,
        user_id: authData.user.id,
        tenant_id: tenant.id,
        email: credentials.email
      };

      let profile: PatientProfile | DoctorProfile | null = null;

      if (credentials.role === 'patient') {
        const { data: patientData, error: patientError } = await this.supabase
          .from('quantumhealth_patient_profiles')
          .insert(profileData)
          .select()
          .single();

        if (patientError) {
          throw new Error('Failed to create patient profile');
        }
        profile = patientData;
      } else {
        const { data: doctorData, error: doctorError } = await this.supabase
          .from('quantumhealth_doctor_profiles')
          .insert(profileData)
          .select()
          .single();

        if (doctorError) {
          throw new Error('Failed to create doctor profile');
        }
        profile = doctorData;
      }

      // 5. Return complete user object
      const authUser: AuthUser = {
        id: authData.user.id,
        email: credentials.email,
        role: credentials.role,
        tenant_id: tenant.id,
        profile
      };

      this.currentUser = authUser;
      return authUser;

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // ===== USER LOGIN =====

  async loginUser(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Invalid credentials');
      }

      // 2. Get current tenant context
      const tenant = multiTenantService.getCurrentTenant();
      if (!tenant) {
        throw new Error('No tenant context available');
      }

      // 3. Verify user role and tenant access
      const { data: roleData, error: roleError } = await this.supabase
        .from('quantumhealth_user_roles')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('tenant_id', tenant.id)
        .eq('role_type', credentials.role)
        .eq('is_active', true)
        .single();

      if (roleError || !roleData) {
        throw new Error('User does not have access to this tenant with the specified role');
      }

      // 4. Load user profile
      const user = await this.getUserWithProfile(authData.user.id);
      if (!user) {
        throw new Error('Failed to load user profile');
      }

      // 5. Create session record
      await this.createSessionRecord(authData.user.id, tenant.id);

      this.currentUser = user;
      this.currentSession = authData.session;
      return user;

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // ===== PASSWORD RESET =====

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }

  // ===== LOGOUT =====

  async logout(): Promise<void> {
    try {
      // 1. Invalidate session record
      if (this.currentSession) {
        await this.invalidateSessionRecord(this.currentSession.access_token);
      }

      // 2. Sign out from Supabase
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }

      // 3. Clear local state
      this.currentUser = null;
      this.currentSession = null;

      // 4. Clear local storage
      localStorage.removeItem('quantumhealth_session');
      localStorage.removeItem('quantumhealth_tenant');

    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // ===== GET CURRENT USER =====

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        const authUser = await this.getUserWithProfile(user.id);
        this.currentUser = authUser;
        return authUser;
      }
    } catch (error) {
      console.error('Get current user error:', error);
    }

    return null;
  }

  // ===== UPDATE USER PROFILE =====

  async updateProfile(profileData: Partial<PatientProfile | DoctorProfile>): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const tableName = user.role === 'patient' 
        ? 'quantumhealth_patient_profiles' 
        : 'quantumhealth_doctor_profiles';

      const { error } = await this.supabase
        .from(tableName)
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Failed to update profile');
      }

      // Refresh current user
      await this.loadCurrentUser();
      return true;

    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  private async getUserWithProfile(userId: string): Promise<AuthUser | null> {
    try {
      // 1. Get user role
      const { data: roleData, error: roleError } = await this.supabase
        .from('quantumhealth_user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (roleError || !roleData) {
        return null;
      }

      // 2. Get user profile based on role
      let profile: PatientProfile | DoctorProfile | null = null;

      if (roleData.role_type === 'patient') {
        const { data: patientData } = await this.supabase
          .from('quantumhealth_patient_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profile = patientData;
      } else if (roleData.role_type === 'doctor') {
        const { data: doctorData } = await this.supabase
          .from('quantumhealth_doctor_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profile = doctorData;
      }

      // 3. Get user email from auth
      const { data: { user } } = await this.supabase.auth.getUser();

      return {
        id: userId,
        email: user?.email || '',
        role: roleData.role_type as 'patient' | 'doctor' | 'admin',
        tenant_id: roleData.tenant_id,
        profile
      };

    } catch (error) {
      console.error('Get user with profile error:', error);
      return null;
    }
  }

  private async createSessionRecord(userId: string, tenantId: string): Promise<void> {
    try {
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

      await this.supabase
        .from('quantumhealth_user_sessions')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          is_active: true,
          ip_address: '127.0.0.1', // In production, get from request
          user_agent: navigator.userAgent
        });

    } catch (error) {
      console.error('Create session record error:', error);
    }
  }

  private async invalidateSessionRecord(accessToken: string): Promise<void> {
    try {
      await this.supabase
        .from('quantumhealth_user_sessions')
        .update({ is_active: false })
        .eq('session_token', accessToken);

    } catch (error) {
      console.error('Invalidate session record error:', error);
    }
  }

  // ===== UTILITY METHODS =====

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  // ===== ERROR HANDLING =====

  private handleAuthError(error: unknown): AuthError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('Invalid login credentials')) {
      return {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password. Please try again.'
      };
    }

    if (errorMessage.includes('Email not confirmed')) {
      return {
        code: 'EMAIL_NOT_CONFIRMED',
        message: 'Please check your email and confirm your account.'
      };
    }

    if (errorMessage.includes('User not found')) {
      return {
        code: 'USER_NOT_FOUND',
        message: 'No account found with this email address.'
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage || 'An unexpected error occurred.'
    };
  }
}

// ===== EXPORT SINGLETON =====

export const authService = new AuthService(); 