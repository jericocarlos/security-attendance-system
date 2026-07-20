import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

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
      whereParts.push("(title LIKE ? OR announcement1 LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereParts.push("status = ?");
      values.push(status);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

    const query = `
      SELECT id, title, announcement1 AS announcement, status, attachment
      FROM announcement
      ${whereClause}
      ORDER BY title ASC
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
    let title = '';
    let announcement = '';
    let attachmentFilename = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = formData.get('title') || '';
      announcement = formData.get('announcement') || '';

      const files = formData.getAll('attachment') || [];
      if (files && files.length > 0) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'announcements');
        await fs.promises.mkdir(uploadsDir, { recursive: true });

        const paths = [];
        for (const file of files) {
          if (file && typeof file.arrayBuffer === 'function') {
            const buf = Buffer.from(await file.arrayBuffer());
            const safeName = `${Date.now()}-${String(file.name || 'upload').replace(/\s+/g,'_')}`;
            const outPath = path.join(uploadsDir, safeName);
            await fs.promises.writeFile(outPath, buf);
            paths.push(`/uploads/announcements/${safeName}`);
          }
        }
        if (paths.length > 0) {
          attachmentFilename = JSON.stringify(paths);
        }
      }
    } else {
      const body = await req.json();
      title = body.title || '';
      announcement = body.announcement || '';
    }

    // Ensure attachment column exists (best-effort)
    try {
      await executeQuery({ query: "ALTER TABLE announcement ADD COLUMN attachment TEXT DEFAULT NULL" });
    } catch (e) {
      // ignore if column already exists or other errors
    }

    const insertQuery = `
      INSERT INTO announcement (title, announcement1, status, attachment)
      VALUES (?, ?, ?, ?)
    `;

    const result = await executeQuery({
      query: insertQuery,
      values: [
        title,
        announcement,
        "enabled",
        attachmentFilename
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