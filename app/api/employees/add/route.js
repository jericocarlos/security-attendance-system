import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request) {
  try {
    const { ashima_id, name, department, position, rfid_tag, photo_url } = await request.json();

    if (!ashima_id || !name || !rfid_tag) {
      return NextResponse.json(
        { error: 'Ashima ID, name, and RFID tag are required.' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO employees (ashima_id, name, department, position, rfid_tag, photo_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await executeQuery({ query, values: [ashima_id, name, department, position, rfid_tag, photo_url || '/placeholder.png'] });

    return NextResponse.json({ success: true, message: 'Employee added successfully!' });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { error: 'Failed to add employee.' },
      { status: 500 }
    );
  }
}