/**
 * Account roles available in the system
 */
export const ACCOUNT_ROLES = [
  { id: "superadmin", name: "Super Admin" },
  { id: "admin", name: "Admin" },
  { id: "security", name: "Security" },
  { id: "hr", name: "HR" }
];

/**
 * Column definitions for the account table - removed email column
 */
export const ACCOUNT_COLUMNS = [
  { id: "username", header: "Username" },
  { id: "name", header: "Full Name" },
  { id: "role", header: "Role" },
  { id: "lastLogin", header: "Last Login" },
  { id: "actions", header: "Actions" }
];

/**
 * Validation schema for account forms
 */
export const ACCOUNT_FORM_VALIDATION = {
  username: {
    required: "Username is required",
    minLength: { value: 3, message: "Username must be at least 3 characters" }
  },
  password: {
    required: "Password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters" }
  },
  name: {
    required: "Full name is required"
  },
  // Email validation removed
  role: {
    required: "Role is required"
  }
};