import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Fetch Announcements with Search, Filters, and Pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    const whereParts = [];
    const values = [];

    if (search) {
      whereParts.push("(title LIKE ? OR announcement LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereParts.push("status = ?");
      values.push(status);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

    const query = `
      SELECT id, title, announcement, status
      FROM announcement
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const announcements = await executeQuery({
      query,
      values: [...values, limit, offset],
    });

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM announcement
      ${whereClause}
    `;

    const totalResult = await executeQuery({
      query: countQuery,
      values,
    });

    return NextResponse.json({
      data: announcements,
      total: totalResult[0]?.total || 0,
      page,
      limit,
    });
  } catch (err) {
    console.error("Failed to fetch announcements:", err);
    return NextResponse.json(
      { message: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
// POST: Add a New Announcement
export async function POST(req) {
  try {
    const body = await req.json();
    const { title, announcement } = body;

    const insertQuery = `
      INSERT INTO announcement (title, announcement, status)
      VALUES (?, ?, ?)
    `;

    const result = await executeQuery({
      query: insertQuery,
      values: [
        title,
        announcement,
        "enabled"
      ]
    });

    // Get the newly inserted ID
    const insertedId = result.insertId;

    // Fetch the complete announcement record with the new ID
    const newIntern = await executeQuery({
      query: "SELECT * FROM announcement WHERE id = ?",
      values: [insertedId]
    });

    return NextResponse.json({
      message: "Announcement created successfully",
      intern: newIntern[0],
      id: insertedId
    });
  } catch (err) {
    console.error("Failed to create announcement:", err);
    return NextResponse.json(
      { message: `Failed to create announcement: ${err.message}` },
      { status: 500 }
    );
  }
}

// DELETE: Delete an Announcement
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      );
    }

    const query = `
      DELETE FROM announcement 
      WHERE id = ?
    `;

    await executeQuery({ query, values: [id] });

    return NextResponse.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Failed to delete announcement:", err);
    return NextResponse.json(
      { message: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}