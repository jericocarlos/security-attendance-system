import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request) {
  try {
    const { ashima_id, name, department, position, rfid_tag, photo, emp_stat, status } = await request.json();

    // Validate required fields
    if (!ashima_id || !name || !rfid_tag) {
      return NextResponse.json(
        { error: 'Ashima ID, name, and RFID tag are required.' },
        { status: 400 }
      );
    }

    // Default values for optional fields
    const defaultStatus = status || 'active';
    const defaultEmpStat = emp_stat || 'N/A'; // Assuming 'N/A' as a placeholder for emp_stat if not provided.

    const query = `
      INSERT INTO employees (ashima_id, name, department, position, rfid_tag, photo, emp_stat, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query
    await executeQuery({
      query,
      values: [
        ashima_id,
        name,
        department || null, // Default to NULL if department is not provided
        position || null,   // Default to NULL if position is not provided
        rfid_tag,
        photo || null,      // Default to NULL if no photo is provided
        defaultEmpStat,
        defaultStatus,
      ],
    });

    return NextResponse.json({ success: true, message: 'Employee added successfully!' });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { error: 'Failed to add employee.' },
      { status: 500 }
    );
  }
}