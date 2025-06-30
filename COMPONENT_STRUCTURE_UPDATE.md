# Component Folder Structure - Updated

## Overview
Reorganized the component structure to follow Next.js and React best practices by moving from `_components` folders to a centralized `components` directory structure.

## New Structure

```
components/
├── admin/                          # Admin-specific components
│   ├── layout/                     # Layout-related components
│   │   ├── Header.jsx             # Admin header component
│   │   ├── SideNav.jsx            # Side navigation with dynamic permissions
│   │   ├── SideNavSkeleton.jsx    # Loading skeleton for navigation
│   │   ├── ProfileDropdown.jsx    # User profile dropdown
│   │   └── index.js               # Barrel exports
│   │
│   ├── employees/                  # Employee management components
│   │   ├── EmployeeTable.jsx      # Employee data table
│   │   ├── EmployeeFormDialog.jsx # Add/edit employee form
│   │   ├── FilterDialog.jsx       # Employee filtering
│   │   ├── DashboardStats.jsx     # Employee statistics
│   │   └── index.js               # Barrel exports
│   │
│   ├── attendance/                 # Attendance management components
│   │   ├── AttendanceTable.jsx    # Attendance logs table
│   │   ├── FilterDialog.jsx       # Attendance filtering
│   │   ├── DashboardStats.jsx     # Attendance statistics
│   │   └── index.js               # Barrel exports
│   │
│   ├── accounts/                   # Account management components
│   │   ├── AccountTable.jsx       # Admin accounts table
│   │   ├── AccountFormDialog.jsx  # Add/edit account form
│   │   ├── FilterDialog.jsx       # Account filtering
│   │   ├── DashboardStats.jsx     # Account statistics
│   │   └── index.js               # Barrel exports
│   │
│   ├── lists/                      # Data management (lists) components
│   │   ├── DepartmentList.jsx     # Department management
│   │   ├── PositionList.jsx       # Position management
│   │   ├── LeaderList.jsx         # Leader management
│   │   ├── ListTable.jsx          # Reusable list table
│   │   ├── AddEditDialog.jsx      # Reusable add/edit dialog
│   │   ├── DeleteConfirmationDialog.jsx # Delete confirmation
│   │   └── index.js               # Barrel exports
│   │
│   └── index.js                   # Main admin components barrel export
│
├── auth/                          # Authentication components
│   ├── PermissionGuard.jsx        # Permission-based route protection
│   ├── LoginForm.jsx              # Login form
│   └── ...
│
├── ui/                            # Reusable UI components
│   ├── button.jsx                 # Button component
│   ├── card.jsx                   # Card component
│   └── ...
│
└── layout/                        # General layout components
    └── home/
        ├── EmployeeCard.js
        └── ...
```

## Benefits of New Structure

### ✅ **Better Organization**
- **Feature-based grouping**: Components grouped by functionality
- **Clear hierarchy**: Easy to find components by their purpose
- **Reduced nesting**: No more deep `_components` folders

### ✅ **Improved Developer Experience**
- **Barrel exports**: Clean imports using index files
- **Consistent naming**: No underscores in folder names
- **Better IDE support**: Easier autocomplete and navigation

### ✅ **Scalability**
- **Easy to extend**: Add new feature folders as needed
- **Reusable components**: Shared components in appropriate locations
- **Clear boundaries**: Separation between admin and general components

## Import Examples

### Before (Old Structure)
```javascript
import SideNav from './_components/SideNav';
import EmployeeTable from './_components/EmployeeTable';
import FilterDialog from './_components/FilterDialog';
```

### After (New Structure)
```javascript
// Individual imports
import { SideNav } from '@/components/admin/layout';
import { EmployeeTable, FilterDialog } from '@/components/admin/employees';

// Or using barrel exports
import { SideNav, Header } from '@/components/admin/layout';
import { EmployeeTable, EmployeeFormDialog, FilterDialog, DashboardStats } from '@/components/admin/employees';
```

## Migration Summary

### Files Moved:
- ❌ `app/admin/(root)/_components/` → ✅ `components/admin/layout/`
- ❌ `app/admin/(root)/employees-management/_components/` → ✅ `components/admin/employees/`
- ❌ `app/admin/(root)/attendance-logs/_components/` → ✅ `components/admin/attendance/`
- ❌ `app/admin/(root)/account-logins/_components/` → ✅ `components/admin/accounts/`
- ❌ `app/admin/(root)/lists/_components/` → ✅ `components/admin/lists/`

### Import Updates:
- All page files updated to use new import paths
- Added barrel export files (`index.js`) for cleaner imports
- Maintained internal component relationships

### Key Features:
- **No breaking changes**: All functionality preserved
- **Cleaner imports**: Using absolute paths and barrel exports
- **Better maintainability**: Easier to find and organize components
- **Follows best practices**: Aligns with Next.js and React conventions

This structure makes the codebase more maintainable, scalable, and follows modern React/Next.js best practices.
