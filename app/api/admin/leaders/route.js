import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.id, e.name, p.name AS position_name
      FROM employees e
      JOIN positions p ON e.position_id = p.id
      WHERE p.is_leader = 1
    `;
    let queryParams = [];
    if (search) {
      query += " AND e.name LIKE ?";
      queryParams.push(`%${search}%`);
    }
    query += " ORDER BY e.name ASC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const leaders = await executeQuery({ query, values: queryParams });

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM employees e
      JOIN positions p ON e.position_id = p.id
      WHERE p.is_leader = 1
    `;
    let countParams = [];
    if (search) {
      countQuery += " AND e.name LIKE ?";
      countParams.push(`%${search}%`);
    }
    const countResult = await executeQuery({ query: countQuery, values: countParams });
    const total = countResult[0].total;

    return NextResponse.json({
      leaders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaders" },
      { status: 500 }
    );
  }
}