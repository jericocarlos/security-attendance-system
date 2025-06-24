import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Fetch a single account by ID
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  
  // Fixed: await params before accessing properties
  const { id } = await params;

  // Check authentication and permissions
  if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
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
      WHERE id = ?
    `;

    const accounts = await executeQuery({
      query,
      values: [id]
    });

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const account = accounts[0];

    // No role mapping needed - return directly from DB
    const formattedAccount = {
      id: account.id,
      name: account.name,
      username: account.username,
      employeeId: account.employeeId,
      role: account.role,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };

    return NextResponse.json(formattedAccount);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// PUT: Update an account
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  
  // Fixed: await params before accessing properties
  const { id } = await params;
  
  // Check authentication and permissions
  if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Get current account to check role
    const currentAccountQuery = `SELECT role FROM admin_users WHERE id = ?`;
    const currentAccount = await executeQuery({
      query: currentAccountQuery,
      values: [id]
    });

    if (!currentAccount || currentAccount.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if this is a superadmin account
    const isSuperAdmin = currentAccount[0].role === 'superadmin';
    
    // Only superadmin can edit superadmin accounts
    if (isSuperAdmin && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Only Super Admin can edit Super Admin accounts' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build update query - role is used directly from request
    let updateFields = ['name = ?', 'role = ?'];
    let values = [body.name, body.role];

    // Add password update if provided
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
      updateFields.push('password = ?');
      values.push(hashedPassword);
    }

    // Complete the values array with the ID
    values.push(id);

    const query = `
      UPDATE admin_users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    await executeQuery({ query, values });

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully'
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an account
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  
  // Fixed: await params before accessing properties
  const { id } = await params;
  
  // Check authentication and permissions
  if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Get current account to check role
    const currentAccountQuery = `SELECT role FROM admin_users WHERE id = ?`;
    const currentAccount = await executeQuery({
      query: currentAccountQuery,
      values: [id]
    });

    if (!currentAccount || currentAccount.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if this is a superadmin account
    const isSuperAdmin = currentAccount[0].role === 'superadmin';
    
    // Only superadmin can delete superadmin accounts
    if (isSuperAdmin && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Only Super Admin can delete Super Admin accounts' },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if (session.user.id === parseInt(id)) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const query = `DELETE FROM admin_users WHERE id = ?`;
    await executeQuery({ query, values: [id] });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}