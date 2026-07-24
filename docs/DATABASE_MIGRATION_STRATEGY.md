# Database Migration Strategy: Supabase → Neon

## 🎯 **Migration Overview**

This document outlines the detailed strategy for migrating QuantumHealth's PostgreSQL database from Supabase to Neon while preserving all multi-tenant architecture, RLS policies, and data integrity.

## 📊 **Current Database Analysis**

### **Existing Schema Structure**:
```sql
-- Core Tables (with quantumhealth_ prefix)
quantumhealth_tenants              -- Master tenant registry
quantumhealth_tenant_users         -- User-tenant relationships
quantumhealth_tenant_settings      -- Per-tenant configuration
quantumhealth_tenant_audit_log     -- Audit trail
quantumhealth_patient_profiles     -- Patient data
quantumhealth_doctor_profiles      -- Doctor data
quantumhealth_medical_reports      -- Medical reports
quantumhealth_appointments         -- Appointment scheduling
quantumhealth_conversations        -- Message conversations
quantumhealth_messages             -- Individual messages
quantumhealth_customers            -- Customer data
quantumhealth_transactions         -- Transaction records
quantumhealth_apartment_records    -- Apartment records
```

### **Critical Dependencies**:
- ✅ **RLS Policies**: 13 tables with tenant isolation policies
- ✅ **Foreign Key Constraints**: 19 FK relationships to maintain
- ⚠️ **auth.users**: Supabase-specific auth table (needs replacement)
- ✅ **UUID Generation**: Standard PostgreSQL functions
- ✅ **JSONB Columns**: Native PostgreSQL support
- ✅ **Timestamps**: Standard PostgreSQL timestamptz

---

## 🏗️ **Neon Database Architecture**

### **Neon Project Structure**:
```
QuantumHealth Neon Project
├── Production Database (Main Branch)
├── Staging Database (Branch: staging)
├── Development Database (Branch: development)
└── Testing Database (Branch: testing)
```

### **Benefits of Neon Architecture**:
- ✅ **Database Branching**: Isolated environments for development
- ✅ **Serverless Scaling**: Auto-scaling compute based on usage
- ✅ **Point-in-time Recovery**: Granular backup and recovery
- ✅ **Connection Pooling**: Built-in connection management
- ✅ **Query Performance**: Advanced query optimization

---

## 📋 **Migration Steps**

### **Phase 1: Environment Setup**

#### **1.1 Neon Account Setup**
```bash
# 1. Create Neon account at https://neon.tech
# 2. Create new project: "quantumhealth-production"
# 3. Set up database branches
```

#### **1.2 Create Database Branches**
```sql
-- Production Branch (default)
CREATE DATABASE quantumhealth_prod;

-- Staging Branch  
CREATE BRANCH staging FROM main;

-- Development Branch
CREATE BRANCH development FROM main;

-- Testing Branch
CREATE BRANCH testing FROM main;
```

#### **1.3 Configure Connection Strings**
```env
# Production
DATABASE_URL=postgresql://username:password@endpoint/quantumhealth_prod?sslmode=require

# Staging
DATABASE_URL_STAGING=postgresql://username:password@staging-endpoint/quantumhealth_staging?sslmode=require

# Development
DATABASE_URL_DEV=postgresql://username:password@dev-endpoint/quantumhealth_dev?sslmode=require
```

### **Phase 2: Schema Migration**

#### **2.1 Export Existing Schema**
```bash
# Export schema only (no data)
pg_dump \
  --host=db.your-supabase-project.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file=supabase_schema.sql
```

#### **2.2 Clean Schema for Neon**
```sql
-- Remove Supabase-specific elements
-- supabase_schema_cleaned.sql

-- Remove auth.users references
-- Remove Supabase extensions
-- Remove Supabase functions
-- Update user references to new auth system

-- Example cleanup:
-- Replace: REFERENCES auth.users(id)
-- With:    user_id UUID NOT NULL (will link to Clerk user IDs)
```

#### **2.3 Enhanced Schema for Neon**
```sql
-- neon_schema.sql

-- 1. Create enhanced tenant table
CREATE TABLE quantumhealth_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  clerk_organization_id TEXT UNIQUE, -- Link to Clerk organization
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Performance indexes
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT valid_plan CHECK (plan IN ('free', 'pro', 'enterprise'))
);

-- 2. Update user relationship table
CREATE TABLE quantumhealth_tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES quantumhealth_tenants(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL, -- Clerk user ID instead of auth.users
  role_type TEXT CHECK (role_type IN ('patient', 'doctor', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, clerk_user_id)
);

-- 3. Update profile tables to reference Clerk users
ALTER TABLE quantumhealth_patient_profiles 
  DROP CONSTRAINT IF EXISTS quantumhealth_patient_profiles_user_id_fkey,
  ALTER COLUMN user_id TYPE TEXT,
  ADD CONSTRAINT patient_profiles_user_check 
    CHECK (user_id IS NOT NULL AND user_id != '');

ALTER TABLE quantumhealth_doctor_profiles 
  DROP CONSTRAINT IF EXISTS quantumhealth_doctor_profiles_user_id_fkey,
  ALTER COLUMN user_id TYPE TEXT,
  ADD CONSTRAINT doctor_profiles_user_check 
    CHECK (user_id IS NOT NULL AND user_id != '');
```

#### **2.4 Enhanced RLS Policies for Neon**
```sql
-- Enhanced RLS with Clerk integration
-- neon_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE quantumhealth_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantumhealth_tenant_users ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables

-- Enhanced tenant isolation policies
CREATE POLICY "tenant_isolation_enhanced" ON quantumhealth_tenants
  FOR ALL USING (
    id = (current_setting('app.current_tenant_id', true))::uuid
    OR current_setting('app.bypass_rls', true) = 'true'
  );

-- User access policies with Clerk integration
CREATE POLICY "user_tenant_access_clerk" ON quantumhealth_tenant_users
  FOR ALL USING (
    clerk_user_id = current_setting('app.current_user_id', true)
    OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid
  );

-- Patient profile access
CREATE POLICY "patient_profile_access" ON quantumhealth_patient_profiles
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    AND (
      user_id = current_setting('app.current_user_id', true)
      OR current_setting('app.user_role', true) IN ('doctor', 'admin')
    )
  );

-- Doctor profile access
CREATE POLICY "doctor_profile_access" ON quantumhealth_doctor_profiles
  FOR ALL USING (
    tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    AND (
      user_id = current_setting('app.current_user_id', true)
      OR current_setting('app.user_role', true) = 'admin'
    )
  );
```

### **Phase 3: Performance Optimization**

#### **3.1 Advanced Indexing Strategy**
```sql
-- Performance indexes for multi-tenant queries
-- neon_indexes.sql

-- Tenant-based compound indexes
CREATE INDEX CONCURRENTLY idx_patients_tenant_user 
  ON quantumhealth_patient_profiles (tenant_id, user_id);

CREATE INDEX CONCURRENTLY idx_doctors_tenant_user 
  ON quantumhealth_doctor_profiles (tenant_id, user_id);

CREATE INDEX CONCURRENTLY idx_appointments_tenant_date 
  ON quantumhealth_appointments (tenant_id, appointment_date DESC);

CREATE INDEX CONCURRENTLY idx_medical_reports_tenant_patient 
  ON quantumhealth_medical_reports (tenant_id, patient_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_messages_tenant_conversation 
  ON quantumhealth_messages (tenant_id, conversation_id, created_at ASC);

-- Search optimization indexes
CREATE INDEX CONCURRENTLY idx_patients_search 
  ON quantumhealth_patient_profiles 
  USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || email));

CREATE INDEX CONCURRENTLY idx_doctors_search 
  ON quantumhealth_doctor_profiles 
  USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || specialization));

-- JSONB optimization
CREATE INDEX CONCURRENTLY idx_tenant_settings_gin 
  ON quantumhealth_tenants USING gin(settings);
```

#### **3.2 Query Optimization Functions**
```sql
-- Utility functions for better performance
-- neon_functions.sql

-- Set tenant context with validation
CREATE OR REPLACE FUNCTION set_tenant_context(
  tenant_slug TEXT,
  user_id TEXT DEFAULT NULL,
  user_role TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  tenant_uuid UUID;
BEGIN
  -- Get tenant ID
  SELECT id INTO tenant_uuid 
  FROM quantumhealth_tenants 
  WHERE slug = tenant_slug AND is_active = true;
  
  IF tenant_uuid IS NULL THEN
    RAISE EXCEPTION 'Invalid tenant: %', tenant_slug;
  END IF;
  
  -- Set session variables
  PERFORM set_config('app.current_tenant_id', tenant_uuid::text, true);
  
  IF user_id IS NOT NULL THEN
    PERFORM set_config('app.current_user_id', user_id, true);
  END IF;
  
  IF user_role IS NOT NULL THEN
    PERFORM set_config('app.user_role', user_role, true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get tenant statistics
CREATE OR REPLACE FUNCTION get_tenant_stats(tenant_uuid UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'total_patients', (
      SELECT COUNT(*) FROM quantumhealth_patient_profiles 
      WHERE tenant_id = tenant_uuid
    ),
    'total_doctors', (
      SELECT COUNT(*) FROM quantumhealth_doctor_profiles 
      WHERE tenant_id = tenant_uuid
    ),
    'total_appointments', (
      SELECT COUNT(*) FROM quantumhealth_appointments 
      WHERE tenant_id = tenant_uuid
    ),
    'total_reports', (
      SELECT COUNT(*) FROM quantumhealth_medical_reports 
      WHERE tenant_id = tenant_uuid
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Phase 4: Data Migration**

#### **4.1 Export Data from Supabase**
```bash
# Export all data
pg_dump \
  --host=db.your-supabase-project.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --data-only \
  --inserts \
  --rows-per-insert=1000 \
  --file=supabase_data.sql

# Clean data for Neon import
# Remove auth.users data
# Update user_id references
sed 's/auth\.users/-- REMOVED auth.users/g' supabase_data.sql > neon_data_cleaned.sql
```

#### **4.2 Data Transformation Script**
```python
# transform_data.py
import psycopg2
import json
from typing import Dict, List

def transform_user_references(source_conn: str, target_conn: str):
    """Transform Supabase auth.users references to Clerk user IDs"""
    
    # This will be implemented based on your specific user migration strategy
    # For now, we'll create placeholder Clerk user IDs
    
    source = psycopg2.connect(source_conn)
    target = psycopg2.connect(target_conn)
    
    try:
        # Map Supabase user IDs to Clerk user IDs
        user_mapping = create_user_mapping(source)
        
        # Update all user_id references
        update_user_references(target, user_mapping)
        
    finally:
        source.close()
        target.close()

def create_user_mapping(conn) -> Dict[str, str]:
    """Create mapping from Supabase user IDs to Clerk user IDs"""
    cursor = conn.cursor()
    cursor.execute("SELECT id, email FROM auth.users")
    
    user_mapping = {}
    for user_id, email in cursor.fetchall():
        # For migration, create deterministic Clerk-style user IDs
        clerk_user_id = f"user_{user_id.replace('-', '')[:16]}"
        user_mapping[user_id] = clerk_user_id
    
    return user_mapping
```

#### **4.3 Import to Neon**
```bash
# Import schema
psql $DATABASE_URL -f neon_schema.sql

# Import RLS policies
psql $DATABASE_URL -f neon_rls_policies.sql

# Import indexes
psql $DATABASE_URL -f neon_indexes.sql

# Import functions
psql $DATABASE_URL -f neon_functions.sql

# Import transformed data
python transform_data.py
psql $DATABASE_URL -f neon_data_transformed.sql
```

### **Phase 5: Validation & Testing**

#### **5.1 Data Integrity Validation**
```sql
-- Validation queries
-- validate_migration.sql

-- Check record counts match
SELECT 'quantumhealth_tenants' as table_name, COUNT(*) as record_count 
FROM quantumhealth_tenants
UNION ALL
SELECT 'quantumhealth_patient_profiles', COUNT(*) 
FROM quantumhealth_patient_profiles
UNION ALL
SELECT 'quantumhealth_doctor_profiles', COUNT(*) 
FROM quantumhealth_doctor_profiles;

-- Validate foreign key relationships
SELECT 
  'Patient profiles without tenant' as check_name,
  COUNT(*) as violation_count
FROM quantumhealth_patient_profiles p
LEFT JOIN quantumhealth_tenants t ON p.tenant_id = t.id
WHERE t.id IS NULL;

-- Validate RLS policies are working
SET app.current_tenant_id = 'invalid-tenant-id';
SELECT COUNT(*) as should_be_zero FROM quantumhealth_patient_profiles;
```

#### **5.2 Performance Testing**
```sql
-- Performance test queries
-- test_performance.sql

-- Test tenant isolation performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM quantumhealth_patient_profiles 
WHERE tenant_id = 'specific-tenant-id'
LIMIT 100;

-- Test search performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM quantumhealth_patient_profiles 
WHERE to_tsvector('english', first_name || ' ' || last_name) 
      @@ to_tsquery('english', 'john & doe')
AND tenant_id = 'specific-tenant-id';
```

---

## 🔧 **Connection & Configuration**

### **Neon Connection Configuration**
```typescript
// src/lib/neon.ts
import { neon, neonConfig } from '@neondatabase/serverless';

// Configure for edge runtime compatibility
neonConfig.fetchConnectionCache = true;

export const sql = neon(process.env.DATABASE_URL!);

// Connection pooling for traditional PostgreSQL client
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### **Environment Variables**
```env
# Neon Database
DATABASE_URL=postgresql://username:password@endpoint/database?sslmode=require

# For different environments
DATABASE_URL_DEV=postgresql://...
DATABASE_URL_STAGING=postgresql://...
DATABASE_URL_PROD=postgresql://...

# Connection pooling
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=2000
```

---

## 🚨 **Rollback Plan**

### **Emergency Rollback Procedure**:
1. **Immediate Rollback**: Switch DNS/environment variables back to Supabase
2. **Data Sync**: Use prepared sync scripts to update Supabase with any new data
3. **Validation**: Verify all systems operational on Supabase
4. **Post-mortem**: Analyze migration issues and prepare for retry

### **Rollback Artifacts**:
- ✅ Supabase backup before migration
- ✅ Data synchronization scripts
- ✅ Environment variable rollback procedures
- ✅ DNS/routing rollback procedures

---

## 📊 **Success Metrics**

### **Migration Success Criteria**:
- [ ] **100% data integrity**: All records migrated correctly
- [ ] **Performance maintained**: Query times within 10% of original
- [ ] **RLS functioning**: Tenant isolation verified
- [ ] **Zero downtime**: Migration completed without service interruption
- [ ] **All tests passing**: Comprehensive test suite validates functionality

### **Post-Migration Monitoring**:
- [ ] **Query performance** monitoring and optimization
- [ ] **Connection pool** utilization and optimization
- [ ] **RLS policy** effectiveness monitoring
- [ ] **Cost optimization** tracking and analysis

---

This database migration strategy ensures a smooth transition from Supabase to Neon while maintaining all multi-tenant capabilities, improving performance, and setting up the foundation for the new Clerk-based authentication system.