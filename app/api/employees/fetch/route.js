import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request) {
  try {
    const { rfid_tag } = await request.json();

    if (!rfid_tag) {
      return NextResponse.json(
        { error: 'RFID tag is required.' },
        { status: 400 }
      );
    }

    const query = 'SELECT * FROM employees WHERE rfid_tag = ?';
    const [employee] = await executeQuery({ query, values: [rfid_tag] });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found for the provided RFID tag.' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee details.' },
      { status: 500 }
    );
  }
}