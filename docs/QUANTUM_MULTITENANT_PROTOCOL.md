# Quantum Climb Multi-Tenant SaaS Protocol

## 🏗️ Project: QuantumHealth - Multi-Tenant Healthcare Platform

This protocol ensures seamless deployment of multi-tenant SaaS applications on the Quantum Database infrastructure with perfect tenant isolation and zero noisy neighbors.

---

## ✅ Key Validation & Configuration Status

### 🔐 **Environment Keys Verification**
```bash
✅ SUPABASE_SERVICE_ROLE_KEY: JWT Format Valid (starts with eyJ...)
✅ SUPABASE_JWT_SECRET: Base64 Format Valid (64+ characters)
✅ VITE_SUPABASE_URL: HTTPS URL Format Valid
✅ VITE_SUPABASE_ANON_KEY: JWT Format Valid
✅ MCP Access Tokens: All Present
```

### 🎯 **Missing Components for Full Multi-Tenant Setup**
- [ ] Tenant ID generation strategy
- [ ] RLS policies implementation  
- [ ] Package.json GitHub integration
- [ ] Vercel.json routing configuration
- [ ] Migration files for tenant isolation

---

## 🏛️ Multi-Tenant Architecture Design

### **Core Principle: One Database, Perfect Isolation**
```
QUANTUM_DATABASE
├── public.tenants (master tenant registry)
├── public.tenant_users (user-tenant relationships)
├── RLS Policies (tenant_id based isolation)
└── Shared Tables (tenant_id column in ALL tables)
```

### **Tenant Isolation Strategy**
1. **Row Level Security (RLS)** on every table
2. **Tenant ID injection** in all operations
3. **Database-level isolation** without schema separation
4. **Resource quotas** per tenant
5. **Audit logging** per tenant

---

## 🔒 Row Level Security (RLS) Implementation

### **1. Master Tenant Table**
```sql
-- Create master tenant registry
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can see their own tenant
CREATE POLICY "Users can only see their own tenant" ON public.tenants
  FOR SELECT USING (id = (current_setting('app.current_tenant_id'))::uuid);
```

### **2. User-Tenant Relationship**
```sql
-- Create user-tenant mapping
CREATE TABLE public.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Policy for tenant-user access
CREATE POLICY "Users can access their tenant relationships" ON public.tenant_users
  FOR ALL USING (user_id = auth.uid());
```

### **3. Application Tables (Example: Medical Reports)**
```sql
-- Every application table MUST have tenant_id
CREATE TABLE public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY "Tenant isolation for medical_reports" ON public.medical_reports
  FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);
```

---

## 🚀 MCP-Driven Automation Protocol

### **Phase 1: Project Initialization**
```bash
# MCP GitHub: Create repository
# MCP Supabase: Create migration files
# MCP Vercel: Setup project and environment variables
```

### **Phase 2: Database Setup** 
```bash
# MCP Supabase: Run tenant infrastructure migrations
# MCP Supabase: Create RLS policies
# MCP Supabase: Setup tenant admin functions
```

### **Phase 3: Application Deployment**
```bash
# MCP GitHub: Push code with proper configuration
# MCP Vercel: Deploy with environment variables
# MCP Supabase: Verify RLS and tenant isolation
```

---

## 📦 Package.json Configuration

### **GitHub Integration Setup**
```json
{
  "name": "quantumhealth",
  "version": "1.0.0",
  "description": "Multi-tenant healthcare platform",
  "repository": {
    "type": "git",
    "url": "https://github.com/QuantumClimb/QuantumHealth.git"
  },
  "homepage": "https://quantumhealth.quantum-climb.com",
  "bugs": {
    "url": "https://github.com/QuantumClimb/QuantumHealth/issues"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "migrate:up": "supabase migration up",
    "migrate:new": "supabase migration new",
    "tenant:create": "node scripts/create-tenant.js",
    "tenant:seed": "node scripts/seed-tenant.js",
    "db:reset": "supabase db reset",
    "db:seed": "supabase seed run"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 🌐 Vercel.json Routing Configuration

### **Multi-Tenant Routing Strategy**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/tenant/([^/]+)/(.*)",
      "dest": "/api/$2?tenant=$1"
    },
    {
      "src": "/([^/]+)/(.*)",
      "dest": "/$2?tenant=$1",
      "continue": true
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "functions": {
    "app/api/**.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

---

## 🗄️ Database Migration Strategy

### **1. Base Infrastructure Migration**
```sql
-- 001_create_tenant_infrastructure.sql
BEGIN;

-- Create tenant registry
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create tenant-user mapping
CREATE TABLE public.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "tenant_isolation" ON public.tenants
  FOR ALL USING (id = (current_setting('app.current_tenant_id'))::uuid);

CREATE POLICY "user_tenant_access" ON public.tenant_users
  FOR ALL USING (user_id = auth.uid());

-- Create tenant management functions
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  tenant_uuid UUID;
BEGIN
  SELECT tenant_id INTO tenant_uuid
  FROM public.tenant_users
  WHERE user_id = user_uuid
  LIMIT 1;
  
  RETURN tenant_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
```

### **2. Application Schema Migration**
```sql
-- 002_create_quantumhealth_tables.sql
BEGIN;

-- Medical Reports Table
CREATE TABLE public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY "tenant_medical_reports" ON public.medical_reports
  FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

CREATE POLICY "tenant_messages" ON public.messages
  FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

CREATE POLICY "tenant_appointments" ON public.appointments
  FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

COMMIT;
```

---

## 🛡️ Anti-Noisy Neighbor Measures

### **1. Resource Quotas per Tenant**
```sql
-- Add resource tracking to tenants table
ALTER TABLE public.tenants ADD COLUMN quota_storage_mb INTEGER DEFAULT 1000;
ALTER TABLE public.tenants ADD COLUMN quota_requests_per_hour INTEGER DEFAULT 10000;
ALTER TABLE public.tenants ADD COLUMN current_storage_mb INTEGER DEFAULT 0;

-- Create usage tracking table
CREATE TABLE public.tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Query Performance Monitoring**
```sql
-- Create slow query tracking
CREATE TABLE public.tenant_query_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  query_hash TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  table_name TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. Rate Limiting Strategy**
```typescript
// Implement at application level
export const rateLimitByTenant = async (tenantId: string, endpoint: string) => {
  const key = `rate_limit:${tenantId}:${endpoint}`;
  // Implement Redis-based rate limiting
  // Return 429 if limit exceeded
};
```

---

## 🔄 Deployment Automation Checklist

### **Pre-Deployment**
- [ ] Environment variables validated
- [ ] Migration files created
- [ ] RLS policies defined
- [ ] Tenant infrastructure ready

### **Deployment**
- [ ] MCP GitHub: Repository created/updated
- [ ] MCP Supabase: Migrations executed
- [ ] MCP Vercel: Project deployed
- [ ] DNS configuration (if custom domain)

### **Post-Deployment**
- [ ] RLS policies active and tested
- [ ] Tenant isolation verified
- [ ] Performance monitoring enabled
- [ ] Backup strategy configured

### **Testing Protocol**
- [ ] Create test tenant
- [ ] Verify data isolation
- [ ] Test cross-tenant access blocked
- [ ] Performance under load
- [ ] Resource quota enforcement

---

## 🎯 Next Steps for QuantumHealth

1. **Create Migration Files** using MCP Supabase
2. **Setup Package.json** with GitHub integration
3. **Configure Vercel.json** for multi-tenant routing
4. **Implement RLS Policies** for tenant isolation
5. **Create Tenant Management Scripts**
6. **Deploy and Test** tenant isolation

This protocol ensures that every project deployed on QUANTUM_DATABASE maintains perfect tenant isolation while leveraging shared infrastructure efficiently.

---

## 📞 Emergency Procedures

### **Tenant Data Breach Response**
1. Immediately audit RLS policies
2. Check tenant_id in all queries
3. Verify user authentication flow
4. Audit recent database changes

### **Performance Degradation**
1. Check tenant resource usage
2. Identify noisy neighbor tenants
3. Implement temporary rate limits
4. Scale infrastructure if needed

---

*This protocol is designed to be reusable across all Quantum Climb projects while maintaining the highest standards of tenant isolation and security.* 