import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: List all accounts with filtering, search, and pagination
export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  // Check authentication and permissions
  if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;
    const role = searchParams.get('role') || '';

    // Build query conditions
    let conditions = [];
    let values = [];

    // Add search condition
    if (search) {
      conditions.push('(name LIKE ? OR username LIKE ? OR employee_id LIKE ?)');
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add role filter
    if (role) {
      conditions.push('role = ?');
      values.push(role);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM admin_users ${whereClause}`;
    const countResult = await executeQuery({
      query: countQuery,
      values: values
    });
    const total = countResult[0].total;

    // Get paginated results
    const query = `
      SELECT 
        id, 
        name, 
        username, 
        employee_id as employeeId, 
        role, 
        last_login as lastLogin,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM admin_users 
      ${whereClause} 
      ORDER BY name
      LIMIT ? OFFSET ?
    `;

    const accounts = await executeQuery({
      query,
      values: [...values, limit, offset]
    });

    // Format accounts - no need to change role names since they match in DB and UI
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      name: account.name,
      username: account.username,
      employeeId: account.employeeId,
      role: account.role,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    }));

    return NextResponse.json({
      data: formattedAccounts,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// POST: Create a new account
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  // Check authentication and permissions
  if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Only superadmin can create superadmin accounts
  const body = await request.json();
  if (body.role === 'superadmin' && session.user.role !== 'superadmin') {
    return NextResponse.json(
      { error: 'Only Super Admin can create Super Admin accounts' },
      { status: 403 }
    );
  }

  try {
    // Validate required fields
    if (!body.username || !body.password || !body.name || !body.role || !body.employeeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // Role is now directly used from request - no mapping needed
    // Insert new account
    const query = `
      INSERT INTO admin_users 
        (name, username, employee_id, password, role) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await executeQuery({
      query,
      values: [
        body.name,
        body.username,
        body.employeeId,
        hashedPassword,
        body.role
      ]
    });

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Account created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);

    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Username or Employee ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}