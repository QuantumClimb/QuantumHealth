# QUANTUM HEALTH - Login Implementation Plan

## 🎯 **Overview**

This document outlines the comprehensive plan for implementing secure patient and doctor login functionality for QUANTUM HEALTH, including authentication, authorization, user management, and multi-tenant security.

## 🏗️ **Architecture Overview**

### **Current State**
- ✅ Basic login UI with role selection (Patient/Doctor)
- ✅ Demo login functionality
- ✅ Multi-tenant database structure
- ✅ Supabase integration
- ✅ RLS policies for tenant isolation

### **Target State**
- 🔐 Real authentication with Supabase Auth
- 👤 User profile management
- 🔒 Role-based access control
- 🏥 Multi-tenant user isolation
- 📱 Session management
- 🔄 Password reset functionality

## 📋 **Implementation Phases**

---

## **Phase 1: Authentication Infrastructure** 🚀

### **1.1 Supabase Auth Setup**

#### **Database Schema Updates**
```sql
-- Enable Supabase Auth
-- Create auth.users table (handled by Supabase)
-- Create user_roles table for role management
CREATE TABLE quantumhealth_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES quantumhealth_tenants(id),
  role_type 'patient' | 'doctor' | 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_sessions table for session management
CREATE TABLE quantumhealth_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES quantumhealth_tenants(id),
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### **RLS Policies**
```sql
-- User roles policies
CREATE POLICY "Users can view their own roles" ON quantumhealth_user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Tenant admins can manage user roles" ON quantumhealth_user_roles
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM quantumhealth_tenants 
      WHERE slug = current_setting('app.current_tenant', true)
    )
  );

-- Session policies
CREATE POLICY "Users can view their own sessions" ON quantumhealth_user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON quantumhealth_user_sessions
  FOR ALL USING (auth.uid() = user_id);
```

### **1.2 Authentication Service**

#### **Create `src/services/authService.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import { multiTenantService } from './supabaseService';

export interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  tenant_id: string;
  profile: PatientProfile | DoctorProfile | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  clinic_id?: string; // For doctors
}

class AuthService {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // User registration
  async registerUser(credentials: LoginCredentials, profileData: any): Promise<AuthUser | null> {
    // Implementation
  }

  // User login
  async loginUser(credentials: LoginCredentials): Promise<AuthUser | null> {
    // Implementation
  }

  // Password reset
  async resetPassword(email: string): Promise<boolean> {
    // Implementation
  }

  // Logout
  async logout(): Promise<void> {
    // Implementation
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    // Implementation
  }

  // Update user profile
  async updateProfile(profileData: any): Promise<boolean> {
    // Implementation
  }
}

export const authService = new AuthService();
```

---

## **Phase 2: User Management** 👥

### **2.1 User Registration Flow**

#### **Patient Registration**
```typescript
interface PatientRegistrationData {
  email: string;
  password: string;
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
```

#### **Doctor Registration**
```typescript
interface DoctorRegistrationData {
  email: string;
  password: string;
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
```

### **2.2 Profile Management**

#### **Create Profile Components**
- `src/components/auth/PatientRegistration.tsx`
- `src/components/auth/DoctorRegistration.tsx`
- `src/components/auth/ProfileUpdate.tsx`
- `src/components/auth/PasswordReset.tsx`

---

## **Phase 3: Login Implementation** 🔐

### **3.1 Enhanced Login Component**

#### **Update `src/pages/Login.tsx`**
```typescript
// Add real authentication
const handleLogin = async () => {
  if (!email || !password) {
    toast({
      title: "Error",
      description: "Please fill in all fields",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);
  
  try {
    const user = await authService.loginUser({
      email,
      password,
      role,
      clinic_id: role === 'doctor' ? clinicId : undefined
    });

    if (user) {
      toast({
        title: "Success",
        description: `Welcome back, ${user.profile?.first_name}!`,
      });
      
      // Navigate to appropriate dashboard
      if (user.role === 'patient') {
        navigate('/patient/dashboard');
      } else {
        navigate('/doctor/dashboard');
      }
    }
  } catch (error) {
    toast({
      title: "Login Failed",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

### **3.2 Registration Flow**

#### **Create `src/pages/Register.tsx`**
```typescript
const Register = () => {
  const [registrationType, setRegistrationType] = useState<'patient' | 'doctor'>('patient');
  const [step, setStep] = useState<'type' | 'credentials' | 'profile' | 'verification'>('type');
  
  // Implementation with multi-step registration
};
```

---

## **Phase 4: Authorization & Security** 🔒

### **4.1 Protected Routes**

#### **Create `src/components/auth/ProtectedRoute.tsx`**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'doctor' | 'admin';
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback = <Navigate to="/login" replace />
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return fallback;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

### **4.2 Auth Context**

#### **Create `src/contexts/AuthContext.tsx`**
```typescript
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Implementation
};
```

---

## **Phase 5: Session Management** 📱

### **5.1 Session Handling**

#### **Session Storage Strategy**
```typescript
// Local storage for persistence
const SESSION_KEY = 'quantumhealth_session';
const TENANT_KEY = 'quantumhealth_tenant';

// Session management utilities
export const sessionUtils = {
  saveSession: (session: any) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  
  getSession: () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },
  
  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TENANT_KEY);
  },
  
  isSessionValid: (session: any) => {
    return session && session.expires_at > new Date().toISOString();
  }
};
```

### **5.2 Auto-logout & Refresh**

#### **Session Monitoring**
```typescript
// Auto-logout on session expiry
useEffect(() => {
  const checkSession = () => {
    const session = sessionUtils.getSession();
    if (session && !sessionUtils.isSessionValid(session)) {
      logout();
      toast({
        title: "Session Expired",
        description: "Please log in again",
        variant: "destructive",
      });
    }
  };
  
  const interval = setInterval(checkSession, 60000); // Check every minute
  return () => clearInterval(interval);
}, []);
```

---

## **Phase 6: Password Management** 🔑

### **6.1 Password Reset Flow**

#### **Create `src/pages/PasswordReset.tsx`**
```typescript
const PasswordReset = () => {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const handleRequestReset = async () => {
    // Implementation
  };
  
  const handleResetPassword = async () => {
    // Implementation
  };
};
```

### **6.2 Password Security**

#### **Password Requirements**
```typescript
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true
};

export const validatePassword = (password: string): PasswordValidationResult => {
  // Implementation
};
```

---

## **Phase 7: Multi-Tenant User Isolation** 🏥

### **7.1 Tenant Context Management**

#### **Enhanced Tenant Context**
```typescript
// Update supabaseService.ts
class MultiTenantSupabaseService {
  private currentTenantId: string | null = null;
  private currentUser: AuthUser | null = null;
  
  async setUserContext(userId: string, tenantId: string): Promise<void> {
    // Set user context for RLS policies
    await this.supabase.rpc('set_user_context', {
      user_uuid: userId,
      tenant_uuid: tenantId
    });
  }
  
  async getUserProfile(userId: string): Promise<PatientProfile | DoctorProfile | null> {
    // Get user profile based on role
  }
}
```

### **7.2 Cross-Tenant Security**

#### **Enhanced RLS Policies**
```sql
-- Ensure users can only access their tenant's data
CREATE POLICY "Users can only access their tenant data" ON quantumhealth_patient_profiles
  FOR ALL USING (
    tenant_id = (
      SELECT tenant_id FROM quantumhealth_user_roles 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

---

## **Phase 8: Testing & Validation** 🧪

### **8.1 Test Cases**

#### **Authentication Tests**
```typescript
describe('Authentication', () => {
  test('Patient can login with valid credentials', async () => {
    // Test implementation
  });
  
  test('Doctor can login with valid credentials and clinic ID', async () => {
    // Test implementation
  });
  
  test('Invalid credentials are rejected', async () => {
    // Test implementation
  });
  
  test('Users are redirected to appropriate dashboard', async () => {
    // Test implementation
  });
});
```

### **8.2 Security Tests**

#### **Authorization Tests**
```typescript
describe('Authorization', () => {
  test('Patients cannot access doctor routes', async () => {
    // Test implementation
  });
  
  test('Users cannot access other tenant data', async () => {
    // Test implementation
  });
  
  test('Session expiry works correctly', async () => {
    // Test implementation
  });
});
```

---

## **Phase 9: UI/UX Enhancements** 🎨

### **9.1 Loading States**

#### **Enhanced Loading Components**
```typescript
// Create loading states for different operations
const LoginLoadingState = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-healthy-500"></div>
    <span>Signing you in...</span>
  </div>
);
```

### **9.2 Error Handling**

#### **User-Friendly Error Messages**
```typescript
const getErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password. Please try again.';
    case 'USER_NOT_FOUND':
      return 'No account found with this email address.';
    case 'ACCOUNT_DISABLED':
      return 'Your account has been disabled. Please contact support.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
```

---

## **Phase 10: Production Deployment** 🚀

### **10.1 Environment Configuration**

#### **Environment Variables**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication Settings
VITE_AUTH_SESSION_DURATION=86400
VITE_PASSWORD_RESET_EXPIRY=3600
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOGIN_TIMEOUT=900

# Security Settings
VITE_ENABLE_2FA=false
VITE_REQUIRE_EMAIL_VERIFICATION=true
VITE_ENABLE_SOCIAL_LOGIN=false
```

### **10.2 Security Headers**

#### **Security Configuration**
```typescript
// Add security headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

---

## **📅 Implementation Timeline**

| **Phase** | **Duration** | **Priority** | **Dependencies** |
|-----------|--------------|--------------|------------------|
| Phase 1: Auth Infrastructure | 3-4 days | 🔴 High | None |
| Phase 2: User Management | 2-3 days | 🔴 High | Phase 1 |
| Phase 3: Login Implementation | 2-3 days | 🔴 High | Phase 1, 2 |
| Phase 4: Authorization | 2-3 days | 🔴 High | Phase 3 |
| Phase 5: Session Management | 1-2 days | 🟡 Medium | Phase 4 |
| Phase 6: Password Management | 1-2 days | 🟡 Medium | Phase 3 |
| Phase 7: Multi-Tenant Security | 2-3 days | 🔴 High | Phase 4 |
| Phase 8: Testing | 2-3 days | 🟡 Medium | Phase 7 |
| Phase 9: UI/UX Enhancements | 1-2 days | 🟢 Low | Phase 8 |
| Phase 10: Production Deployment | 1 day | 🔴 High | Phase 9 |

**Total Estimated Time**: 15-25 days

---

## **🎯 Success Criteria**

### **Functional Requirements**
- ✅ Users can register as patients or doctors
- ✅ Users can login with email/password
- ✅ Role-based access control works correctly
- ✅ Multi-tenant isolation is maintained
- ✅ Password reset functionality works
- ✅ Session management is secure
- ✅ Auto-logout on session expiry

### **Security Requirements**
- ✅ No SQL injection vulnerabilities
- ✅ XSS protection implemented
- ✅ CSRF protection enabled
- ✅ Secure password storage (bcrypt)
- ✅ Rate limiting on login attempts
- ✅ Audit logging for security events

### **Performance Requirements**
- ✅ Login response time < 2 seconds
- ✅ Session validation < 100ms
- ✅ Concurrent user support > 1000
- ✅ 99.9% uptime for authentication service

### **User Experience Requirements**
- ✅ Intuitive login/registration flow
- ✅ Clear error messages
- ✅ Responsive design for mobile
- ✅ Accessibility compliance (WCAG 2.1)
- ✅ Progressive enhancement

---

## **🔧 Technical Stack**

### **Frontend**
- React 18 + TypeScript
- Supabase Auth
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling

### **Backend**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- JWT tokens for authentication
- bcrypt for password hashing

### **Security**
- HTTPS only
- Secure cookies
- CSP headers
- Rate limiting
- Input validation

---

## **📚 Additional Resources**

### **Documentation**
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [OWASP Authentication Guidelines](https://owasp.org/www-project-authentication-cheat-sheet/)

### **Testing Tools**
- Jest for unit testing
- React Testing Library for component testing
- Cypress for E2E testing
- OWASP ZAP for security testing

---

**Status**: 📋 **PLAN READY FOR IMPLEMENTATION**  
**Created**: January 23, 2025  
**Next Step**: Begin Phase 1 - Authentication Infrastructure 