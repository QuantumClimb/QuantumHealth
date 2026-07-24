# Authentication Migration Strategy: Supabase Auth → Clerk

## 🎯 **Migration Overview**

This document outlines the complete strategy for migrating QuantumHealth's authentication system from Supabase Auth to Clerk, maintaining multi-tenant architecture while gaining enhanced authentication capabilities and better developer experience.

## 📊 **Current Authentication Analysis**

### **Existing Supabase Auth Dependencies**:
```typescript
// Current auth implementation
src/services/authService.ts
├── Supabase createClient
├── signUp, signInWithPassword
├── resetPasswordForEmail
├── getUser, getSession
├── signOut
└── JWT token management

src/contexts/AuthContext.tsx
├── Basic auth state management
├── Simple login/logout functions
└── Minimal session handling

src/components/auth/ProtectedRoute.tsx
├── Basic route protection
└── Role-based access (patient/doctor/admin)
```

### **Authentication Flow Dependencies**:
- ✅ **User Registration**: Supabase Auth + custom profile creation
- ✅ **User Login**: Email/password with role validation
- ✅ **Session Management**: Supabase session tokens
- ✅ **Password Reset**: Supabase email-based reset
- ✅ **Role Management**: Custom tenant_users table
- ✅ **Multi-tenant**: Custom tenant context switching

---

## 🏗️ **Clerk Authentication Architecture**

### **Why Clerk for Healthcare SaaS?**
1. **Multi-tenant Ready**: Built-in organizations and role management
2. **Healthcare Compliant**: HIPAA, SOC 2 compliance out of the box
3. **Superior UX**: Pre-built auth components with excellent design
4. **Developer Experience**: React hooks, TypeScript support, webhooks
5. **Scalability**: Enterprise-grade infrastructure
6. **Security**: Advanced session management, MFA, fraud detection

### **Clerk Feature Mapping**:
```
Current Feature          →  Clerk Equivalent
─────────────────────────────────────────────────
Tenants                  →  Organizations
User Roles              →  Organization Roles
Custom Auth Forms       →  Clerk Components
Session Management      →  Clerk Session Management
Password Reset          →  Clerk Password Reset
User Profiles          →  Clerk User Metadata
Multi-tenant Context   →  Organization Context
```

---

## 📋 **Migration Strategy**

### **Phase 1: Clerk Setup & Configuration**

#### **1.1 Clerk Account Setup**
```bash
# 1. Create Clerk account at https://clerk.com
# 2. Create application: "quantumhealth-production"
# 3. Configure authentication methods
# 4. Set up organizations (multi-tenant)
```

#### **1.2 Clerk Application Configuration**
```javascript
// Clerk Dashboard Configuration
{
  "application_name": "QuantumHealth",
  "authentication_methods": {
    "email_password": true,
    "social_logins": false,  // HIPAA compliance
    "phone_verification": true,
    "magic_links": false     // For security
  },
  "organizations": {
    "enabled": true,
    "max_allowed_memberships": 1,  // Users belong to one clinic
    "creator_role": "admin",
    "delete_protection": true
  },
  "session_management": {
    "session_lifetime": "24h",
    "multi_session": false,  // Healthcare security
    "session_token_template": "jwt"
  }
}
```

#### **1.3 Custom Roles Configuration**
```javascript
// Organization Roles in Clerk
const organizationRoles = [
  {
    key: "admin",
    name: "Administrator",
    description: "Full system access",
    permissions: [
      "org:sys:all",
      "org:mem:create",
      "org:mem:read", 
      "org:mem:update",
      "org:mem:delete"
    ]
  },
  {
    key: "doctor", 
    name: "Doctor",
    description: "Healthcare provider access",
    permissions: [
      "org:patient:read",
      "org:patient:update",
      "org:report:create",
      "org:report:read",
      "org:appointment:manage"
    ]
  },
  {
    key: "patient",
    name: "Patient", 
    description: "Patient access",
    permissions: [
      "org:profile:read",
      "org:profile:update",
      "org:appointment:create",
      "org:report:read"
    ]
  }
];
```

### **Phase 2: Frontend Integration**

#### **2.1 Install and Configure Clerk**
```bash
npm install @clerk/nextjs
# or for React apps
npm install @clerk/clerk-react
```

#### **2.2 New Authentication Provider**
```typescript
// src/providers/ClerkProvider.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { TenantProvider } from './TenantProvider';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: '#14b8a6', // QuantumHealth brand color
          colorBackground: '#ffffff',
          colorInputBackground: '#f8fafc'
        },
        elements: {
          formButtonPrimary: 'bg-healthy-500 hover:bg-healthy-600',
          card: 'shadow-lg border border-gray-200'
        }
      }}
    >
      <TenantProvider>
        {children}
      </TenantProvider>
    </ClerkProvider>
  );
}
```

#### **2.3 Enhanced Auth Context**
```typescript
// src/contexts/AuthContext.tsx
import { useUser, useOrganization, useAuth } from '@clerk/nextjs';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: ClerkUser | null;
  organization: Organization | null;
  role: 'patient' | 'doctor' | 'admin' | null;
  tenantId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { signOut: clerkSignOut } = useAuth();
  
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin' | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (userLoaded && orgLoaded && organization) {
      // Get user role in current organization
      const membership = organization.memberships.find(m => m.publicUserData.userId === user?.id);
      if (membership) {
        setRole(membership.role as 'patient' | 'doctor' | 'admin');
        setTenantId(organization.id);
      }
    }
  }, [user, organization, userLoaded, orgLoaded]);

  const signOut = async () => {
    await clerkSignOut();
    setRole(null);
    setTenantId(null);
  };

  const switchOrganization = async (orgId: string) => {
    // Clerk handles organization switching
    window.location.href = `/organization/${orgId}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        tenantId,
        loading: !userLoaded || !orgLoaded,
        signOut,
        switchOrganization
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

#### **2.4 Enhanced Protected Routes**
```typescript
// src/components/auth/ProtectedRoute.tsx
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'doctor' | 'admin';
  requireOrganization?: boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  requireOrganization = true,
  fallbackPath = '/sign-in' 
}: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { role, organization, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || loading) return;

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      router.push(fallbackPath);
      return;
    }

    // Redirect to organization selection if no organization
    if (requireOrganization && !organization) {
      router.push('/select-organization');
      return;
    }

    // Check role requirements
    if (requiredRole && role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }

  }, [isSignedIn, isLoaded, organization, role, loading, requiredRole, requireOrganization]);

  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthy-600"></div>
      </div>
    );
  }

  // Show content if all checks pass
  if (isSignedIn && (!requireOrganization || organization) && (!requiredRole || role === requiredRole)) {
    return <>{children}</>;
  }

  return null;
}
```

### **Phase 3: Authentication Components**

#### **3.1 Custom Sign-in Component**
```typescript
// src/components/auth/SignIn.tsx
import { SignIn as ClerkSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export function SignIn() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-healthy-50 to-nature-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/assets/QuantumHealth_Logo.png" 
            alt="QuantumHealth" 
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <ClerkSignIn
          afterSignInUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              card: "shadow-2xl border-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary: "bg-healthy-500 hover:bg-healthy-600 text-white",
              footerActionLink: "text-healthy-600 hover:text-healthy-700"
            }
          }}
        />
      </div>
    </div>
  );
}
```

#### **3.2 Custom Sign-up with Role Selection**
```typescript
// src/components/auth/SignUp.tsx
import { SignUp as ClerkSignUp } from '@clerk/nextjs';
import { useState } from 'react';

export function SignUp() {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>('patient');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-healthy-50 to-nature-50">
      <div className="max-w-4xl w-full flex gap-8">
        {/* Role Selection */}
        <div className="w-1/2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Role</h2>
          
          <div className="space-y-4">
            <RoleCard
              role="patient"
              title="Patient Account"
              description="Book appointments, view reports, communicate with doctors"
              icon="👤"
              selected={selectedRole === 'patient'}
              onSelect={() => setSelectedRole('patient')}
            />
            
            <RoleCard
              role="doctor"
              title="Healthcare Provider"
              description="Manage patients, create reports, schedule appointments"
              icon="🩺"
              selected={selectedRole === 'doctor'}
              onSelect={() => setSelectedRole('doctor')}
            />
          </div>
        </div>

        {/* Sign-up Form */}
        <div className="w-1/2">
          <ClerkSignUp
            afterSignUpUrl="/onboarding"
            signInUrl="/sign-in"
            unsafeMetadata={{ role: selectedRole }}
            appearance={{
              elements: {
                card: "shadow-2xl border-0",
                formButtonPrimary: "bg-healthy-500 hover:bg-healthy-600"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

### **Phase 4: Organization Management**

#### **4.1 Organization Creation Flow**
```typescript
// src/components/auth/CreateOrganization.tsx
import { CreateOrganization as ClerkCreateOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export function CreateOrganization() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Your Healthcare Organization
          </h1>
          <p className="text-gray-600 mt-2">
            Set up your clinic or healthcare practice
          </p>
        </div>

        <ClerkCreateOrganization
          afterCreateOrganizationUrl="/onboarding/organization"
          appearance={{
            elements: {
              card: "shadow-xl border border-gray-200",
              formButtonPrimary: "bg-healthy-500 hover:bg-healthy-600"
            }
          }}
        />
      </div>
    </div>
  );
}
```

#### **4.2 Organization Selection**
```typescript
// src/components/auth/OrganizationSelector.tsx
import { OrganizationSwitcher, useOrganizationList } from '@clerk/nextjs';

export function OrganizationSelector() {
  const { organizationList } = useOrganizationList();

  if (!organizationList || organizationList.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          No Organizations Found
        </h3>
        <p className="text-gray-600 mb-6">
          You're not a member of any healthcare organizations yet.
        </p>
        <Button asChild>
          <Link href="/create-organization">
            Create Organization
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h2 className="text-2xl font-bold text-center mb-8">
        Select Your Organization
      </h2>
      
      <OrganizationSwitcher
        afterSelectOrganizationUrl="/dashboard"
        afterCreateOrganizationUrl="/onboarding/organization"
        appearance={{
          elements: {
            organizationSwitcherTrigger: "border border-gray-300 rounded-lg p-4 hover:border-healthy-500",
            organizationSwitcherPopoverCard: "shadow-xl border border-gray-200"
          }
        }}
      />
    </div>
  );
}
```

### **Phase 5: User Migration Strategy**

#### **5.1 User Data Export from Supabase**
```sql
-- Export user data for migration
SELECT 
  u.id as supabase_user_id,
  u.email,
  u.created_at,
  tu.role_type,
  tu.tenant_id,
  t.name as tenant_name,
  t.slug as tenant_slug
FROM auth.users u
JOIN quantumhealth_tenant_users tu ON u.id = tu.user_id
JOIN quantumhealth_tenants t ON tu.tenant_id = t.id
WHERE u.email IS NOT NULL
ORDER BY u.created_at;
```

#### **5.2 User Migration Script**
```typescript
// scripts/migrate-users.ts
import { clerkClient } from '@clerk/nextjs/server';
import { pool } from '@/lib/neon';

interface SupabaseUser {
  supabase_user_id: string;
  email: string;
  created_at: string;
  role_type: 'patient' | 'doctor' | 'admin';
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
}

async function migrateUsers() {
  // 1. Export users from Supabase
  const { rows: supabaseUsers } = await pool.query<SupabaseUser>(`
    SELECT 
      u.id as supabase_user_id,
      u.email,
      u.created_at,
      tu.role_type,
      tu.tenant_id,
      t.name as tenant_name,
      t.slug as tenant_slug
    FROM auth.users u
    JOIN quantumhealth_tenant_users tu ON u.id = tu.user_id
    JOIN quantumhealth_tenants t ON tu.tenant_id = t.id
    WHERE u.email IS NOT NULL
  `);

  // 2. Create organizations in Clerk
  const orgMapping = new Map<string, string>();
  
  for (const user of supabaseUsers) {
    if (!orgMapping.has(user.tenant_id)) {
      const organization = await clerkClient.organizations.createOrganization({
        name: user.tenant_name,
        slug: user.tenant_slug,
        publicMetadata: {
          originalTenantId: user.tenant_id,
          migratedAt: new Date().toISOString()
        }
      });
      orgMapping.set(user.tenant_id, organization.id);
    }
  }

  // 3. Create invitation system for users
  for (const user of supabaseUsers) {
    const clerkOrgId = orgMapping.get(user.tenant_id)!;
    
    // Create invitation
    await clerkClient.organizations.createOrganizationInvitation({
      organizationId: clerkOrgId,
      emailAddress: user.email,
      role: user.role_type,
      publicMetadata: {
        originalUserId: user.supabase_user_id,
        migratedAt: new Date().toISOString()
      }
    });
  }

  // 4. Update database with Clerk organization IDs
  for (const [tenantId, clerkOrgId] of orgMapping) {
    await pool.query(`
      UPDATE quantumhealth_tenants 
      SET clerk_organization_id = $1 
      WHERE id = $2
    `, [clerkOrgId, tenantId]);
  }
}
```

#### **5.3 User Onboarding Flow**
```typescript
// src/components/auth/UserOnboarding.tsx
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export function UserOnboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({});

  const role = user?.unsafeMetadata?.role as 'patient' | 'doctor';

  useEffect(() => {
    // Check if user has completed onboarding
    if (user?.publicMetadata?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [user]);

  const completeOnboarding = async () => {
    // Update user metadata
    await user?.update({
      publicMetadata: {
        ...user.publicMetadata,
        onboardingCompleted: true,
        role: role
      }
    });

    // Create profile in database
    await createUserProfile(profile);
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto">
        <OnboardingSteps
          currentStep={step}
          role={role}
          profile={profile}
          onProfileChange={setProfile}
          onNext={() => setStep(step + 1)}
          onComplete={completeOnboarding}
        />
      </div>
    </div>
  );
}
```

---

## 🔧 **Webhook Integration**

### **Clerk Webhooks for Database Sync**
```typescript
// src/pages/api/webhooks/clerk.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { pool } from '@/lib/neon';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  // Handle different webhook events
  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data);
      break;
    case 'organizationMembership.created':
      await handleMembershipCreated(evt.data);
      break;
    case 'organization.created':
      await handleOrganizationCreated(evt.data);
      break;
  }

  return new Response('', { status: 200 });
}

async function handleUserCreated(userData: any) {
  // Sync user to database
  await pool.query(`
    INSERT INTO quantumhealth_users (
      clerk_user_id, 
      email, 
      first_name, 
      last_name
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (clerk_user_id) DO NOTHING
  `, [
    userData.id,
    userData.email_addresses[0]?.email_address,
    userData.first_name,
    userData.last_name
  ]);
}
```

---

## 📊 **Migration Timeline & Success Metrics**

### **Week 1: Setup & Configuration**
- [ ] Clerk account and application setup
- [ ] Organization roles configuration  
- [ ] Development environment integration
- [ ] Basic authentication flow testing

### **Week 2: Component Migration**
- [ ] Replace AuthContext with Clerk hooks
- [ ] Update ProtectedRoute components
- [ ] Implement new sign-in/sign-up flows
- [ ] Test role-based access control

### **Week 3: User Migration**
- [ ] Export user data from Supabase
- [ ] Create organizations in Clerk
- [ ] Set up user invitation system
- [ ] Test user migration process

### **Week 4: Integration & Testing**
- [ ] Webhook integration for database sync
- [ ] Comprehensive testing of all auth flows
- [ ] Performance testing
- [ ] Security audit

### **Success Criteria**:
- [ ] **100% user migration** with no data loss
- [ ] **All auth flows functional** (sign-in, sign-up, reset)
- [ ] **Multi-tenant isolation maintained**
- [ ] **Performance equal or better** than Supabase Auth
- [ ] **Security compliance maintained** (HIPAA ready)

---

This authentication migration strategy provides a comprehensive path from Supabase Auth to Clerk while maintaining all multi-tenant capabilities and improving the overall user experience and security posture of QuantumHealth.