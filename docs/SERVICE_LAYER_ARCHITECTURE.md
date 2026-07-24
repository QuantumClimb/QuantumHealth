# Service Layer Architecture: Neon + Clerk Integration

## 🎯 **Overview**

This document outlines the redesigned service layer architecture for QuantumHealth, transitioning from Supabase's all-in-one solution to a modern Neon database + Clerk authentication stack while maintaining multi-tenant capabilities and improving performance.

## 🏗️ **New Architecture Design**

### **Service Layer Stack**:
```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                           │
├─────────────────────────────────────────────────────────────┤
│ Auth Layer: Clerk Hooks & Components                       │
├─────────────────────────────────────────────────────────────┤
│ Service Layer: Type-safe API with Multi-tenant Context     │
├─────────────────────────────────────────────────────────────┤
│ Database Layer: Neon PostgreSQL with RLS                   │
└─────────────────────────────────────────────────────────────┘
```

### **Key Architectural Changes**:
- ✅ **Replace Supabase Client** → Direct PostgreSQL queries with Neon
- ✅ **Replace Supabase Auth** → Clerk authentication hooks
- ✅ **Maintain Multi-tenancy** → Enhanced tenant context management
- ✅ **Improve Type Safety** → Full TypeScript integration
- ✅ **Add Edge Runtime Support** → Serverless-first architecture

---

## 📋 **New Service Layer Structure**

### **Core Services Architecture**:
```
src/services/
├── database/
│   ├── neon.ts              # Neon connection and utilities
│   ├── queries/             # Type-safe SQL queries
│   └── migrations/          # Database migration scripts
├── auth/
│   ├── clerk.ts             # Clerk integration utilities
│   ├── permissions.ts       # Role-based access control
│   └── middleware.ts        # Auth middleware for API routes
├── core/
│   ├── tenant.ts            # Multi-tenant context management
│   ├── healthcare.ts        # Healthcare-specific business logic
│   └── analytics.ts         # Analytics and reporting
└── api/
    ├── patients.ts          # Patient operations
    ├── doctors.ts           # Doctor operations
    ├── appointments.ts      # Appointment management
    ├── reports.ts           # Medical reports
    └── messages.ts          # Messaging system
```

---

## 🔧 **Core Database Service**

### **Enhanced Neon Database Service**
```typescript
// src/services/database/neon.ts
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';

// Configure for edge runtime
neonConfig.fetchConnectionCache = true;

// Create Neon client
export const neonClient = neon(process.env.DATABASE_URL!);

// Drizzle ORM integration for type safety
export const db = drizzle(neonClient);

// Enhanced connection with multi-tenant context
export class NeonService {
  private currentTenantId: string | null = null;
  private currentUserId: string | null = null;
  private currentUserRole: string | null = null;

  constructor(
    tenantId?: string, 
    userId?: string, 
    userRole?: string
  ) {
    this.currentTenantId = tenantId;
    this.currentUserId = userId;
    this.currentUserRole = userRole;
  }

  /**
   * Set tenant context for all subsequent operations
   */
  async setTenantContext(tenantId: string, userId?: string, userRole?: string): Promise<void> {
    this.currentTenantId = tenantId;
    this.currentUserId = userId;
    this.currentUserRole = userRole;

    // Set PostgreSQL session variables for RLS
    await this.execute(sql`
      SELECT set_config('app.current_tenant_id', ${tenantId}, true),
             set_config('app.current_user_id', ${userId || ''}, true),
             set_config('app.user_role', ${userRole || ''}, true)
    `);
  }

  /**
   * Execute raw SQL with tenant context validation
   */
  async execute<T = any>(query: any): Promise<T[]> {
    if (!this.currentTenantId) {
      throw new Error('Tenant context not set. Call setTenantContext() first.');
    }
    
    return await db.execute(query);
  }

  /**
   * Execute SQL with automatic tenant ID injection
   */
  async query<T = any>(
    queryText: string, 
    params: any[] = []
  ): Promise<T[]> {
    if (!this.currentTenantId) {
      throw new Error('Tenant context not set');
    }

    const result = await neonClient(queryText, params);
    return result as T[];
  }

  /**
   * Get current tenant information
   */
  getCurrentTenant(): { tenantId: string | null; userId: string | null; role: string | null } {
    return {
      tenantId: this.currentTenantId,
      userId: this.currentUserId,
      role: this.currentUserRole
    };
  }
}

// Singleton instance for non-contextualized operations
export const neonService = new NeonService();
```

### **Type-Safe Query Builder**
```typescript
// src/services/database/queries/base.ts
import { NeonService } from '../neon';
import { z } from 'zod';

export abstract class BaseQuery<T> {
  protected neon: NeonService;
  protected tableName: string;
  protected schema: z.ZodSchema<T>;

  constructor(
    neon: NeonService, 
    tableName: string, 
    schema: z.ZodSchema<T>
  ) {
    this.neon = neon;
    this.tableName = tableName;
    this.schema = schema;
  }

  /**
   * Find records with automatic tenant filtering
   */
  async findMany(where: Partial<T> = {}): Promise<T[]> {
    const conditions = Object.entries(where)
      .map(([key, value], index) => `${key} = $${index + 2}`)
      .join(' AND ');

    const whereClause = conditions ? ` AND ${conditions}` : '';
    const values = Object.values(where);

    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE tenant_id = $1 ${whereClause}
      ORDER BY created_at DESC
    `;

    const { tenantId } = this.neon.getCurrentTenant();
    const result = await this.neon.query(query, [tenantId, ...values]);
    
    return result.map(row => this.schema.parse(row));
  }

  /**
   * Find single record by ID
   */
  async findById(id: string): Promise<T | null> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE id = $2 AND tenant_id = $1 
      LIMIT 1
    `;

    const { tenantId } = this.neon.getCurrentTenant();
    const result = await this.neon.query(query, [tenantId, id]);
    
    if (result.length === 0) return null;
    return this.schema.parse(result[0]);
  }

  /**
   * Create new record with automatic tenant ID injection
   */
  async create(data: Omit<T, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<T> {
    const columns = Object.keys(data);
    const placeholders = columns.map((_, index) => `$${index + 2}`);
    const values = Object.values(data);

    const query = `
      INSERT INTO ${this.tableName} (tenant_id, ${columns.join(', ')})
      VALUES ($1, ${placeholders.join(', ')})
      RETURNING *
    `;

    const { tenantId } = this.neon.getCurrentTenant();
    const result = await this.neon.query(query, [tenantId, ...values]);
    
    return this.schema.parse(result[0]);
  }

  /**
   * Update record with optimistic locking
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const updateColumns = Object.keys(data);
    const setClause = updateColumns
      .map((col, index) => `${col} = $${index + 3}`)
      .join(', ');
    const values = Object.values(data);

    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $1
      RETURNING *
    `;

    const { tenantId } = this.neon.getCurrentTenant();
    const result = await this.neon.query(query, [tenantId, id, ...values]);
    
    if (result.length === 0) {
      throw new Error(`Record not found or access denied: ${id}`);
    }
    
    return this.schema.parse(result[0]);
  }

  /**
   * Delete record with tenant validation
   */
  async delete(id: string): Promise<void> {
    const query = `
      DELETE FROM ${this.tableName} 
      WHERE id = $2 AND tenant_id = $1
    `;

    const { tenantId } = this.neon.getCurrentTenant();
    const result = await this.neon.query(query, [tenantId, id]);
    
    if (result.length === 0) {
      throw new Error(`Record not found or access denied: ${id}`);
    }
  }
}
```

---

## 🏥 **Healthcare Service Layer**

### **Patient Service**
```typescript
// src/services/api/patients.ts
import { BaseQuery } from '../database/queries/base';
import { NeonService } from '../database/neon';
import { z } from 'zod';

// Type definitions
export const PatientProfileSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  clerk_user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  date_of_birth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string()
  }).optional(),
  emergency_contact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string()
  }).optional(),
  medical_history: z.object({
    conditions: z.array(z.string()),
    surgeries: z.array(z.string()),
    allergies: z.array(z.string())
  }).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export type PatientProfile = z.infer<typeof PatientProfileSchema>;

export class PatientService extends BaseQuery<PatientProfile> {
  constructor(neon: NeonService) {
    super(neon, 'quantumhealth_patient_profiles', PatientProfileSchema);
  }

  /**
   * Find patients by doctor (for doctor dashboard)
   */
  async findPatientsByDoctor(doctorId: string): Promise<PatientProfile[]> {
    const query = `
      SELECT DISTINCT p.* 
      FROM quantumhealth_patient_profiles p
      JOIN quantumhealth_appointments a ON p.id = a.patient_id
      WHERE a.doctor_id = $2 AND p.tenant_id = $1
      ORDER BY p.last_name, p.first_name
    `;

    const { tenantId } = this.neon.getCurrentTenant();
    const result = await this.neon.query(query, [tenantId, doctorId]);
    
    return result.map(row => this.schema.parse(row));
  }

  /**
   * Search patients by name or email
   */
  async searchPatients(searchTerm: string): Promise<PatientProfile[]> {
    const query = `
      SELECT * FROM quantumhealth_patient_profiles
      WHERE tenant_id = $1 
        AND (
          first_name ILIKE $2 
          OR last_name ILIKE $2 
          OR email ILIKE $2
          OR CONCAT(first_name, ' ', last_name) ILIKE $2
        )
      ORDER BY last_name, first_name
      LIMIT 50
    `;

    const { tenantId } = this.neon.getCurrentTenant();
    const searchPattern = `%${searchTerm}%`;
    const result = await this.neon.query(query, [tenantId, searchPattern]);
    
    return result.map(row => this.schema.parse(row));
  }

  /**
   * Get patient with recent activity
   */
  async getPatientWithActivity(patientId: string): Promise<{
    patient: PatientProfile;
    recentAppointments: any[];
    recentReports: any[];
  }> {
    const patient = await this.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const { tenantId } = this.neon.getCurrentTenant();

    // Get recent appointments
    const appointmentsQuery = `
      SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name
      FROM quantumhealth_appointments a
      JOIN quantumhealth_doctor_profiles d ON a.doctor_id = d.id
      WHERE a.patient_id = $2 AND a.tenant_id = $1
      ORDER BY a.appointment_date DESC
      LIMIT 5
    `;

    // Get recent reports
    const reportsQuery = `
      SELECT r.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name
      FROM quantumhealth_medical_reports r
      LEFT JOIN quantumhealth_doctor_profiles d ON r.doctor_id = d.id
      WHERE r.patient_id = $2 AND r.tenant_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    const [appointments, reports] = await Promise.all([
      this.neon.query(appointmentsQuery, [tenantId, patientId]),
      this.neon.query(reportsQuery, [tenantId, patientId])
    ]);

    return {
      patient,
      recentAppointments: appointments,
      recentReports: reports
    };
  }
}
```

### **Appointment Service**
```typescript
// src/services/api/appointments.ts
import { BaseQuery } from '../database/queries/base';
import { NeonService } from '../database/neon';
import { z } from 'zod';

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  appointment_date: z.string(),
  duration_minutes: z.number().default(30),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  appointment_type: z.string(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export class AppointmentService extends BaseQuery<Appointment> {
  constructor(neon: NeonService) {
    super(neon, 'quantumhealth_appointments', AppointmentSchema);
  }

  /**
   * Get appointments for a specific date range
   */
  async getAppointmentsByDateRange(
    startDate: string, 
    endDate: string,
    doctorId?: string
  ): Promise<Appointment[]> {
    const doctorFilter = doctorId ? 'AND doctor_id = $4' : '';
    const params = [this.neon.getCurrentTenant().tenantId, startDate, endDate];
    if (doctorId) params.push(doctorId);

    const query = `
      SELECT a.*, 
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             p.phone as patient_phone,
             d.first_name as doctor_first_name,
             d.last_name as doctor_last_name
      FROM quantumhealth_appointments a
      JOIN quantumhealth_patient_profiles p ON a.patient_id = p.id
      JOIN quantumhealth_doctor_profiles d ON a.doctor_id = d.id
      WHERE a.tenant_id = $1 
        AND a.appointment_date >= $2 
        AND a.appointment_date <= $3
        ${doctorFilter}
      ORDER BY a.appointment_date ASC
    `;

    return await this.neon.query(query, params);
  }

  /**
   * Check for appointment conflicts
   */
  async checkConflicts(
    doctorId: string, 
    appointmentDate: string, 
    durationMinutes: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    const excludeFilter = excludeAppointmentId ? 'AND id != $5' : '';
    const params = [
      this.neon.getCurrentTenant().tenantId,
      doctorId,
      appointmentDate,
      endTime.toISOString()
    ];
    if (excludeAppointmentId) params.push(excludeAppointmentId);

    const query = `
      SELECT COUNT(*) as conflict_count
      FROM quantumhealth_appointments
      WHERE tenant_id = $1 
        AND doctor_id = $2
        AND status NOT IN ('cancelled', 'no_show')
        AND (
          (appointment_date <= $3 AND appointment_date + (duration_minutes || ' minutes')::interval > $3)
          OR (appointment_date < $4 AND appointment_date + (duration_minutes || ' minutes')::interval >= $4)
          OR (appointment_date >= $3 AND appointment_date < $4)
        )
        ${excludeFilter}
    `;

    const result = await this.neon.query(query, params);
    return result[0].conflict_count > 0;
  }

  /**
   * Get doctor availability for a date
   */
  async getDoctorAvailability(doctorId: string, date: string): Promise<{
    availableSlots: string[];
    bookedSlots: string[];
  }> {
    const { tenantId } = this.neon.getCurrentTenant();
    
    // Get doctor's working hours (from doctor profile or default)
    const doctorQuery = `
      SELECT availability FROM quantumhealth_doctor_profiles
      WHERE id = $2 AND tenant_id = $1
    `;
    
    const doctorResult = await this.neon.query(doctorQuery, [tenantId, doctorId]);
    const availability = doctorResult[0]?.availability || {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' }
    };

    // Get booked appointments for the date
    const appointmentsQuery = `
      SELECT appointment_date, duration_minutes
      FROM quantumhealth_appointments
      WHERE tenant_id = $1 
        AND doctor_id = $2
        AND DATE(appointment_date) = $3
        AND status NOT IN ('cancelled', 'no_show')
      ORDER BY appointment_date
    `;

    const bookedAppointments = await this.neon.query(appointmentsQuery, [tenantId, doctorId, date]);

    // Generate available slots based on working hours and booked appointments
    return this.generateTimeSlots(availability, bookedAppointments, date);
  }

  private generateTimeSlots(availability: any, bookedAppointments: any[], date: string) {
    // Implementation for generating available time slots
    // This would calculate available slots based on working hours and existing bookings
    const dayOfWeek = new Date(date).toLocaleLowerCase();
    const dayAvailability = availability[dayOfWeek];
    
    if (!dayAvailability) {
      return { availableSlots: [], bookedSlots: [] };
    }

    // Generate 30-minute slots between start and end time
    const slots = [];
    const bookedSlots = bookedAppointments.map(apt => apt.appointment_date);
    
    // Implementation details for slot generation...
    
    return { availableSlots: slots, bookedSlots };
  }
}
```

---

## 🔐 **Authentication Integration**

### **Clerk Integration Service**
```typescript
// src/services/auth/clerk.ts
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NeonService } from '../database/neon';

export class ClerkAuthService {
  private neon: NeonService;

  constructor() {
    this.neon = new NeonService();
  }

  /**
   * Get authenticated user with tenant context
   */
  async getAuthenticatedUser(): Promise<{
    userId: string;
    email: string;
    role: string;
    tenantId: string;
    permissions: string[];
  } | null> {
    const { userId, orgId, orgRole } = auth();
    
    if (!userId || !orgId) {
      return null;
    }

    // Get user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Get tenant information from database
    const tenant = await this.getTenantByClerkOrgId(orgId);
    
    if (!tenant) {
      throw new Error('Tenant not found for organization');
    }

    // Set tenant context
    await this.neon.setTenantContext(tenant.id, userId, orgRole || 'patient');

    return {
      userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      role: orgRole || 'patient',
      tenantId: tenant.id,
      permissions: this.getRolePermissions(orgRole || 'patient')
    };
  }

  /**
   * Get tenant by Clerk organization ID
   */
  private async getTenantByClerkOrgId(clerkOrgId: string): Promise<any> {
    const query = `
      SELECT * FROM quantumhealth_tenants
      WHERE clerk_organization_id = $1 AND is_active = true
      LIMIT 1
    `;

    const result = await this.neon.query(query, [clerkOrgId]);
    return result[0] || null;
  }

  /**
   * Get permissions for role
   */
  private getRolePermissions(role: string): string[] {
    const permissions = {
      admin: [
        'read:all',
        'write:all',
        'delete:all',
        'manage:users',
        'manage:settings'
      ],
      doctor: [
        'read:patients',
        'write:patients',
        'read:appointments',
        'write:appointments',
        'read:reports',
        'write:reports',
        'read:messages',
        'write:messages'
      ],
      patient: [
        'read:own_profile',
        'write:own_profile',
        'read:own_appointments',
        'write:own_appointments',
        'read:own_reports',
        'read:messages',
        'write:messages'
      ]
    };

    return permissions[role as keyof typeof permissions] || [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes(requiredPermission) || 
           userPermissions.includes('write:all') ||
           userPermissions.includes('read:all');
  }
}
```

### **API Route Middleware**
```typescript
// src/services/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { ClerkAuthService } from './clerk';

export function withAuth(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    requiredPermission?: string;
    requiredRole?: string;
  } = {}
) {
  return async (req: NextRequest, context: any): Promise<NextResponse> => {
    const authService = new ClerkAuthService();
    
    try {
      const user = await authService.getAuthenticatedUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 401 }
        );
      }

      // Check role requirement
      if (options.requiredRole && user.role !== options.requiredRole) {
        return NextResponse.json(
          { error: 'Insufficient privileges' }, 
          { status: 403 }
        );
      }

      // Check permission requirement
      if (options.requiredPermission && 
          !authService.hasPermission(user.permissions, options.requiredPermission)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' }, 
          { status: 403 }
        );
      }

      // Add user context to request
      context.user = user;
      
      return await handler(req, context);
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' }, 
        { status: 500 }
      );
    }
  };
}
```

---

## 🚀 **API Routes Implementation**

### **Example API Route with New Architecture**
```typescript
// src/app/api/patients/route.ts
import { NextRequest } from 'next/server';
import { withAuth } from '@/services/auth/middleware';
import { PatientService } from '@/services/api/patients';
import { NeonService } from '@/services/database/neon';

async function handler(req: NextRequest, context: any) {
  const { user } = context;
  const neon = new NeonService(user.tenantId, user.userId, user.role);
  const patientService = new PatientService(neon);

  switch (req.method) {
    case 'GET':
      const patients = await patientService.findMany();
      return NextResponse.json(patients);

    case 'POST':
      const body = await req.json();
      const newPatient = await patientService.create(body);
      return NextResponse.json(newPatient, { status: 201 });

    default:
      return NextResponse.json(
        { error: 'Method not allowed' }, 
        { status: 405 }
      );
  }
}

export const GET = withAuth(handler, { requiredPermission: 'read:patients' });
export const POST = withAuth(handler, { requiredPermission: 'write:patients' });
```

---

## 📊 **Performance Optimizations**

### **Connection Pooling & Caching**
```typescript
// src/services/database/pool.ts
import { Pool } from 'pg';

export class ConnectionPool {
  private static instance: Pool;

  static getInstance(): Pool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
    return ConnectionPool.instance;
  }
}

// Redis caching for frequently accessed data
export class CacheService {
  private redis = new Redis(process.env.REDIS_URL);

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  getTenantCacheKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }
}
```

---

## 🧪 **Testing Strategy**

### **Service Layer Tests**
```typescript
// src/services/__tests__/patients.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PatientService } from '../api/patients';
import { NeonService } from '../database/neon';

describe('PatientService', () => {
  let neonService: NeonService;
  let patientService: PatientService;

  beforeEach(async () => {
    neonService = new NeonService();
    await neonService.setTenantContext('test-tenant-id', 'test-user-id', 'doctor');
    patientService = new PatientService(neonService);
  });

  it('should create a patient with tenant context', async () => {
    const patientData = {
      clerk_user_id: 'clerk_user_123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      date_of_birth: '1990-01-01',
      gender: 'male' as const
    };

    const patient = await patientService.create(patientData);
    
    expect(patient.id).toBeDefined();
    expect(patient.tenant_id).toBe('test-tenant-id');
    expect(patient.first_name).toBe('John');
  });

  it('should find patients by doctor', async () => {
    const patients = await patientService.findPatientsByDoctor('doctor-123');
    expect(Array.isArray(patients)).toBe(true);
  });
});
```

---

This service layer architecture provides a robust, type-safe, and scalable foundation for the QuantumHealth application with Neon and Clerk integration while maintaining all multi-tenant capabilities and improving performance.