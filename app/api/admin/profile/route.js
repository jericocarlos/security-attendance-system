import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  
  // Check authentication
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name, username, employeeId } = await request.json();
    
    // Validate required fields
    if (!name || !username || !employeeId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    const checkUsernameQuery = `
      SELECT id FROM admin_users 
      WHERE username = ? AND id != ?
    `;
    
    const usernameExists = await executeQuery({
      query: checkUsernameQuery,
      values: [username, session.user.id]
    });

    if (usernameExists.length > 0) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Check if employee ID is already taken by another user
    const checkEmployeeIdQuery = `
      SELECT id FROM admin_users 
      WHERE employee_id = ? AND id != ?
    `;
    
    const employeeIdExists = await executeQuery({
      query: checkEmployeeIdQuery,
      values: [employeeId, session.user.id]
    });

    if (employeeIdExists.length > 0) {
      return NextResponse.json(
        { error: 'Employee ID is already taken' },
        { status: 409 }
      );
    }

    // Update user profile
    const updateQuery = `
      UPDATE admin_users 
      SET name = ?, username = ?, employee_id = ?
      WHERE id = ?
    `;

    await executeQuery({
      query: updateQuery,
      values: [name, username, employeeId, session.user.id]
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}