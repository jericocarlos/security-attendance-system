import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const id = params.id;
    
    const supervisors = await executeQuery({
      query: 'SELECT * FROM supervisors WHERE id = ?',
      values: [id]
    });
    
    if (supervisors.length === 0) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(supervisors[0]);
  } catch (error) {
    console.error('Error fetching supervisor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisor' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Supervisor name is required' },
        { status: 400 }
      );
    }
    
    // Check if supervisor exists
    const existingSupervisors = await executeQuery({
      query: 'SELECT * FROM supervisors WHERE id = ?',
      values: [id]
    });
    
    if (existingSupervisors.length === 0) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }
    
    // Check if name is already used by another supervisor
    const duplicateSupervisors = await executeQuery({
      query: 'SELECT * FROM supervisors WHERE name = ? AND id != ?',
      values: [body.name.trim(), id]
    });
    
    if (duplicateSupervisors.length > 0) {
      return NextResponse.json(
        { error: 'A supervisor with this name already exists' },
        { status: 400 }
      );
    }
    
    // Update supervisor
    await executeQuery({
      query: 'UPDATE supervisors SET name = ? WHERE id = ?',
      values: [body.name.trim(), id]
    });
    
    return NextResponse.json({
      id: parseInt(id),
      name: body.name.trim()
    });
  } catch (error) {
    console.error('Error updating supervisor:', error);
    return NextResponse.json(
      { error: 'Failed to update supervisor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    // Check if supervisor exists
    const existingSupervisors = await executeQuery({
      query: 'SELECT * FROM supervisors WHERE id = ?',
      values: [id]
    });
    
    if (existingSupervisors.length === 0) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      );
    }
    
    // Check if supervisor is assigned to any employees
    const assignedEmployees = await executeQuery({
      query: 'SELECT COUNT(*) as count FROM employees WHERE supervisor_id = ?',
      values: [id]
    });
    
    if (assignedEmployees[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supervisor that is assigned to employees' },
        { status: 400 }
      );
    }
    
    // Delete supervisor
    await executeQuery({
      query: 'DELETE FROM supervisors WHERE id = ?',
      values: [id]
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supervisor:', error);
    return NextResponse.json(
      { error: 'Failed to delete supervisor' },
      { status: 500 }
    );
  }
}