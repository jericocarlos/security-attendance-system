import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Route to module mapping with support for dynamic routes
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
  hr: ['attendance_logs', 'employees_management']
};

// Public routes that don't require authentication
const publicRoutes = [
  '/admin/login',
  '/api/auth/',
  '/api/admin/role-permissions/by-role', // Allow middleware to call this
  '/favicon.ico'
];

// API routes that need special handling
const apiRoutes = {
  '/api/admin/': 'admin_api',
  '/api/attendance/': 'attendance_api'
};

// Cache for database permissions (5 minute TTL)
const permissionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// Rate limiting for failed authentication attempts
const failedAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

/**
 * Check if IP is rate limited due to failed attempts
 */
function isRateLimited(ip) {
  const attempts = failedAttempts.get(ip);
  if (!attempts) return false;
  
  const now = Date.now();
  // Clean up old attempts outside the window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  failedAttempts.set(ip, recentAttempts);
  
  return recentAttempts.length >= MAX_FAILED_ATTEMPTS;
}

/**
 * Record a failed authentication attempt
 */
function recordFailedAttempt(ip) {
  const attempts = failedAttempts.get(ip) || [];
  attempts.push(Date.now());
  failedAttempts.set(ip, attempts);
}

/**
 * Check if route is public and doesn't require authentication
 */
function isPublicRoute(pathname) {
  return publicRoutes.some(route => pathname.startsWith(route));
}

/**
 * Get module name from route pathname
 */
function getModuleFromRoute(pathname) {
  // Check for exact matches first
  const exactMatch = routeModuleMap[pathname];
  if (exactMatch) return exactMatch;

  // Check for prefix matches (for dynamic routes)
  const matchedRoute = Object.keys(routeModuleMap).find(route => 
    pathname.startsWith(route)
  );
  
  return matchedRoute ? routeModuleMap[matchedRoute] : null;
}

/**
 * Get user permissions from database with caching
 */
async function getUserPermissions(role) {
  const cacheKey = `middleware_permissions_${role}`;
  const cached = permissionsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/role-permissions/by-role?role=${encodeURIComponent(role)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add internal authentication header
        'x-middleware-auth': process.env.NEXTAUTH_SECRET,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    const permissions = data.permissions || [];

    // Convert to simplified format for middleware
    const permissionsSet = new Set();
    permissions.forEach(perm => {
      const parsedPermission = typeof perm.permission === 'string' 
        ? JSON.parse(perm.permission) 
        : perm.permission;
      
      // If user has any permission on the module, allow access
      if (Object.values(parsedPermission).some(Boolean)) {
        permissionsSet.add(perm.module);
      }
    });

    const permissionsArray = Array.from(permissionsSet);
    
    // Cache the result
    permissionsCache.set(cacheKey, {
      data: permissionsArray,
      timestamp: Date.now()
    });

    return permissionsArray;
  } catch (error) {
    console.error('Middleware: Database permissions check failed, using fallback:', error);
    // Fallback to default permissions if database is unavailable
    return defaultPermissions[role] || [];
  }
}

/**
 * Check if user has permission for a route
 */
async function hasRouteAccess(pathname, role) {
  // Always allow access to main dashboard
  if (pathname === "/admin" || pathname === "/admin/") {
    return true;
  }

  // Handle API routes
  const apiRoute = Object.keys(apiRoutes).find(route => pathname.startsWith(route));
  if (apiRoute) {
    // API routes have their own permission checks, allow middleware to pass
    // Individual API endpoints will handle granular permissions
    return true;
  }

  const moduleName = getModuleFromRoute(pathname);
  
  if (!moduleName) {
    // Allow access to routes not in our module map (e.g., profile, settings)
    return true;
  }

  try {
    // Try to get permissions from database first
    const userPermissions = await getUserPermissions(role);
    return userPermissions.includes(moduleName);
  } catch (error) {
    console.error('Middleware: Permission check failed, using fallback:', error);
    // Fallback to default permissions
    const rolePermissions = defaultPermissions[role] || [];
    return rolePermissions.includes(moduleName);
  }
}

/**
 * Log security events for audit trail
 */
function logSecurityEvent(event, details) {
  const timestamp = new Date().toISOString();
  
  // Sanitize details to prevent log injection
  const sanitizedDetails = Object.keys(details).reduce((acc, key) => {
    const value = details[key];
    if (typeof value === 'string') {
      // Remove newlines and control characters that could be used for log injection
      acc[key] = value.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, '');
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  console.log(`[SECURITY] ${timestamp} - ${event}:`, JSON.stringify(sanitizedDetails));
  
  // In production, you might want to send this to a logging service
  // or store in a security audit table
}

/**
 * Main middleware function
 */
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'Unknown';

  try {
    // Allow public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // Get authentication token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Handle unauthenticated users
    if (!token) {
      // Check for rate limiting
      if (isRateLimited(ip)) {
        logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          pathname,
          ip,
          userAgent: userAgent.substring(0, 100)
        });
        
        // Return 429 Too Many Requests for rate limited IPs
        return new Response('Too Many Requests', { status: 429 });
      }

      recordFailedAttempt(ip);
      
      logSecurityEvent('UNAUTHENTICATED_ACCESS_ATTEMPT', {
        pathname,
        ip,
        userAgent: userAgent.substring(0, 100) // Truncate for logs
      });

      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      return NextResponse.next();
    }

    const role = token.role;

    // Validate token has required fields
    if (!role || !token.id) {
      logSecurityEvent('INVALID_TOKEN', {
        pathname,
        userId: token.id,
        role: token.role,
        ip
      });
      
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // SUPERADMIN has access to everything
    if (role === "superadmin") {
      return NextResponse.next();
    }

    // Check route-specific permissions
    const hasAccess = await hasRouteAccess(pathname, role);
    
    if (hasAccess) {
      return NextResponse.next();
    } else {
      // Log unauthorized access attempt
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        pathname,
        userId: token.id,
        role: token.role,
        ip,
        userAgent: userAgent.substring(0, 100)
      });

      // Redirect to dashboard with error indication
      const redirectUrl = new URL("/admin", req.url);
      redirectUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(redirectUrl);
    }

  } catch (error) {
    // Log middleware errors
    console.error('Middleware error:', error);
    logSecurityEvent('MIDDLEWARE_ERROR', {
      pathname,
      error: error.message,
      ip
    });

    // For critical errors, redirect to login
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    
    return NextResponse.next();
  }
}

/**
 * Clear permissions cache (useful when permissions are updated)
 */
export function clearPermissionsCache(role = null) {
  if (role) {
    permissionsCache.delete(`middleware_permissions_${role}`);
  } else {
    permissionsCache.clear();
  }
}

/**
 * Clean up expired cache entries and failed attempts
 */
export function cleanupCache() {
  const now = Date.now();
  
  // Clean up permissions cache
  for (const [key, value] of permissionsCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      permissionsCache.delete(key);
    }
  }
  
  // Clean up failed attempts
  for (const [ip, attempts] of failedAttempts.entries()) {
    const recentAttempts = attempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    if (recentAttempts.length === 0) {
      failedAttempts.delete(ip);
    } else {
      failedAttempts.set(ip, recentAttempts);
    }
  }
}

export const config = {
  matcher: [
    // Match all admin routes
    "/admin/:path*",
    // Match protected API routes  
    "/api/admin/:path*",
    // Exclude static files, images, auth routes, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|api/auth).*)",
  ],
};