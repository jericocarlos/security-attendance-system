-- Migration script to simplify permissions from read/write/delete/export to access only
-- This script updates existing role_permissions records to use only the access permission

-- First, let's update all existing permissions to use only access: true
UPDATE role_permissions 
SET permission = JSON_OBJECT('access', true)
WHERE JSON_EXTRACT(permission, '$.read') = true 
   OR JSON_EXTRACT(permission, '$.write') = true 
   OR JSON_EXTRACT(permission, '$.delete') = true 
   OR JSON_EXTRACT(permission, '$.export') = true
   OR JSON_EXTRACT(permission, '$.access') = true;

-- Update any records that don't have access permission to false
UPDATE role_permissions 
SET permission = JSON_OBJECT('access', false)
WHERE JSON_EXTRACT(permission, '$.access') IS NULL
  AND JSON_EXTRACT(permission, '$.read') != true 
  AND JSON_EXTRACT(permission, '$.write') != true 
  AND JSON_EXTRACT(permission, '$.delete') != true 
  AND JSON_EXTRACT(permission, '$.export') != true;

-- Ensure superadmin always has access to all modules
UPDATE role_permissions 
SET permission = JSON_OBJECT('access', true)
WHERE role = 'superadmin';

-- Display updated permissions for verification
SELECT 
  id,
  role,
  module,
  permission,
  updated_at
FROM role_permissions 
ORDER BY 
  FIELD(role, 'superadmin', 'admin', 'security', 'hr'),
  module;
