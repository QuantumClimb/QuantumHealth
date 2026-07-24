# QuantumHealth Database Table Names

This document lists all the database tables used by the QuantumHealth application with the `quantumhealth_` prefix for better organization and clarity.

## Table Names

### Core Tables
- `quantumhealth_tenants` - Tenant information and settings
- `quantumhealth_tenant_users` - User-tenant relationships and roles

### Profile Tables
- `quantumhealth_patient_profiles` - Patient information and medical history
- `quantumhealth_doctor_profiles` - Doctor information and professional details

### Medical Data Tables
- `quantumhealth_medical_reports` - Medical reports and documents
- `quantumhealth_appointments` - Appointment scheduling and management

### Communication Tables
- `quantumhealth_conversations` - Message conversations between users
- `quantumhealth_messages` - Individual messages within conversations

## Benefits of Prefixing

1. **Clear Organization**: All QuantumHealth tables are easily identifiable
2. **Multi-Tenant Clarity**: Reduces confusion when multiple projects share the same database
3. **Easy Filtering**: Database administrators can easily filter QuantumHealth tables
4. **Namespace Isolation**: Prevents naming conflicts with other applications
5. **Better Documentation**: Clear table ownership and purpose

## Migration Notes

If you have existing tables without the prefix, you'll need to:

1. **Rename existing tables** to add the `quantumhealth_` prefix
2. **Update any external references** to the old table names
3. **Update database policies** and RLS rules
4. **Test all functionality** to ensure the changes work correctly

## Example Migration SQL

```sql
-- Rename existing tables (if they exist)
ALTER TABLE tenants RENAME TO quantumhealth_tenants;
ALTER TABLE tenant_users RENAME TO quantumhealth_tenant_users;
ALTER TABLE patient_profiles RENAME TO quantumhealth_patient_profiles;
ALTER TABLE doctor_profiles RENAME TO quantumhealth_doctor_profiles;
ALTER TABLE medical_reports RENAME TO quantumhealth_medical_reports;
ALTER TABLE appointments RENAME TO quantumhealth_appointments;
ALTER TABLE conversations RENAME TO quantumhealth_conversations;
ALTER TABLE messages RENAME TO quantumhealth_messages;

-- Update any foreign key references
-- Update any RLS policies
-- Update any database functions that reference these tables
```

## Current Implementation Status

✅ **All table references updated in the codebase**
✅ **Service layer updated to use new table names**
✅ **TypeScript interfaces remain unchanged**
✅ **Multi-tenant architecture preserved**
✅ **All functionality tested and working**

## Future Considerations

- When adding new tables, always use the `quantumhealth_` prefix
- Consider creating a database schema migration system
- Document any new tables in this file
- Maintain consistent naming conventions across all tables 