import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Route to module mapping
const routeModuleMap = {
  '/admin/employees-management': 'employees_management',
  '/admin/lists': 'data_management',
  '/admin/account-logins': 'account_logins',
  '/admin/attendance-logs': 'attendance_logs',
  '/admin/role-permissions': 'role_permissions'
};

// Default permissions for fallback (when database is unavailable)
const defaultPermissions = {
  superadmin: ['employees_management', 'data_management', 'account_logins', 'attendance_logs', 'role_permissions'],
  admin: ['employees_management', 'data_management', 'account_logins', 'attendance_logs'],
  security: ['attendance_logs'],
  hr: ['attendance_logs', 'employees_management'] // Make sure HR has employees_management
};

// Cache for database permissions (5 minute TTL)
const permissionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Clear permissions cache for debugging
 */
function clearPermissionsCache() {
  permissionsCache.clear();
  console.log('[MIDDLEWARE] Permissions cache cleared');
}

/**
 * Get user permissions from database with caching
 */
async function getUserPermissions(role) {
  const cacheKey = `middleware_permissions_${role}`;
  const cached = permissionsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[MIDDLEWARE] Using cached permissions for ${role}:`, cached.data);
    return cached.data;
  }

  console.log(`[MIDDLEWARE] Fetching fresh permissions for role: ${role}`);

  try {
    // Make API call to get permissions
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/admin/role-permissions/by-role?role=${encodeURIComponent(role)}`;
    
    console.log(`[MIDDLEWARE] Calling API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[MIDDLEWARE] API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[MIDDLEWARE] API response data:`, data);
    
    const permissions = data.permissions || [];

    // Convert to simplified format for middleware
    const permissionsSet = new Set();
    permissions.forEach(perm => {
      console.log(`[MIDDLEWARE] Processing permission:`, perm);
      
      const parsedPermission = typeof perm.permission === 'string' 
        ? JSON.parse(perm.permission) 
        : perm.permission;
      
      console.log(`[MIDDLEWARE] Parsed permission:`, parsedPermission);
      
      // If user has access permission on the module, allow access
      if (parsedPermission.access === true) {
        permissionsSet.add(perm.module);
        console.log(`[MIDDLEWARE] Added module to permissions: ${perm.module}`);
      }
    });

    const permissionsArray = Array.from(permissionsSet);
    
    // Cache the result
    permissionsCache.set(cacheKey, {
      data: permissionsArray,
      timestamp: Date.now()
    });

    console.log(`[MIDDLEWARE] Final permissions for ${role}:`, permissionsArray);
    return permissionsArray;
  } catch (error) {
    console.error('Middleware: Database permissions check failed, using fallback:', error);
    // Fallback to default permissions if database is unavailable
    const fallbackPermissions = defaultPermissions[role] || [];
    console.log(`[MIDDLEWARE] Using fallback permissions for ${role}:`, fallbackPermissions);
    return fallbackPermissions;
  }
}

// Function to check if user has permission for a route
async function hasRouteAccess(pathname, role) {
  // Always allow access to main dashboard
  if (pathname === "/admin" || pathname === "/admin/") {
    return true;
  }

  // Find the module for this route
  const matchedRoute = Object.keys(routeModuleMap).find(route => 
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    // If route not in our module map, allow access (for other admin routes)
    return true;
  }

  const moduleName = routeModuleMap[matchedRoute];
  
  // TEMPORARY FIX: Always allow HR access to employees_management
  if (role === 'hr' && moduleName === 'employees_management') {
    console.log(`[MIDDLEWARE] TEMPORARY: Allowing HR access to employees_management`);
    return true;
  }
  
  try {
    // Try to get permissions from database first
    const userPermissions = await getUserPermissions(role);
    const hasAccess = userPermissions.includes(moduleName);
    
    console.log(`[MIDDLEWARE] Checking access for ${role} to ${moduleName}: ${hasAccess}`);
    console.log(`[MIDDLEWARE] User permissions:`, userPermissions);
    
    return hasAccess;
  } catch (error) {
    console.error('Middleware: Permission check failed, using fallback:', error);
    // Fallback to default permissions
    const rolePermissions = defaultPermissions[role] || [];
    const hasAccess = rolePermissions.includes(moduleName);
    
    console.log(`[MIDDLEWARE] Fallback check for ${role} to ${moduleName}: ${hasAccess}`);
    return hasAccess;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow access to /admin/login and API routes without authentication
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  console.log(`[MIDDLEWARE] Processing request for: ${pathname}`);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect unauthenticated users
  if (!token) {
    console.log(`[MIDDLEWARE] No token found, redirecting to login`);
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  const role = token.role;
  const username = token.username || token.name || 'unknown';
  console.log(`[MIDDLEWARE] User ${username} with role ${role} accessing ${pathname}`);

  // SUPERADMIN has access to everything
  if (role === "superadmin") {
    console.log(`[MIDDLEWARE] Superadmin access granted`);
    return NextResponse.next();
  }

  // Clear cache for HR role to force fresh check (temporary debugging)
  if (role === 'hr') {
    console.log(`[MIDDLEWARE] Clearing cache for HR role to force fresh check`);
    permissionsCache.delete(`middleware_permissions_${role}`);
  }

  // Check permissions based on role and route
  try {
    const hasAccess = await hasRouteAccess(pathname, role);
    if (hasAccess) {
      console.log(`[MIDDLEWARE] Access granted for ${role} to ${pathname}`);
      return NextResponse.next();
    } else {
      console.log(`[MIDDLEWARE] Access denied for ${role} to ${pathname}`);
      // Redirect to dashboard if no access
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } catch (error) {
    console.error(`[MIDDLEWARE] Error checking access:`, error);
    // On error, redirect to dashboard
    return NextResponse.redirect(new URL("/admin", req.url));
  }
}

export const config = {
  matcher: [
    // Match all admin routes but exclude API routes
    "/admin/:path*"
  ],
};