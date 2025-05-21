import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM supervisors';
    let countQuery = 'SELECT COUNT(*) as total FROM supervisors';
    
    if (search) {
      query += ' WHERE name LIKE ?';
      countQuery += ' WHERE name LIKE ?';
    }
    
    query += ' ORDER BY name LIMIT ? OFFSET ?';
    
    const searchPattern = search ? `%${search}%` : '';
    
    // Get total count
    const countResult = await executeQuery({
      query: countQuery,
      values: search ? [searchPattern] : []
    });
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Get supervisors for current page
    const supervisors = await executeQuery({
      query: query,
      values: search ? [searchPattern, limit, offset] : [limit, offset]
    });
    
    return NextResponse.json({
      supervisors,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching supervisors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisors' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Supervisor name is required' },
        { status: 400 }
      );
    }
    
    // Check if supervisor already exists
    const existingSupervisors = await executeQuery({
      query: 'SELECT * FROM supervisors WHERE name = ?',
      values: [body.name.trim()]
    });
    
    if (existingSupervisors.length > 0) {
      return NextResponse.json(
        { error: 'A supervisor with this name already exists' },
        { status: 400 }
      );
    }
    
    // Insert new supervisor
    const result = await executeQuery({
      query: 'INSERT INTO supervisors (name) VALUES (?)',
      values: [body.name.trim()]
    });
    
    return NextResponse.json({
      id: result.insertId,
      name: body.name.trim()
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating supervisor:', error);
    return NextResponse.json(
      { error: 'Failed to create supervisor' },
      { status: 500 }
    );
  }
}