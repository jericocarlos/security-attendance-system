import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// PUT: Update an Existing Announcement
export async function PUT(req, context) {
  try {
    const { id } = context.params;
    const body = await req.json();

    const {
      title,
      announcement,
      status
    } = body;

    const updateFields = [];
    const values = [];

    // Only include fields that are provided to avoid sending undefined to SQL
    if (typeof title !== 'undefined') {
      updateFields.push("title = ?");
      values.push(title ?? null);
    }

    if (typeof announcement !== 'undefined') {
      updateFields.push("announcement = ?");
      values.push(announcement ?? null);
    }

    if (typeof status !== 'undefined') {
      updateFields.push("status = ?");
      values.push(status ?? null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields provided to update' }, { status: 400 });
    }

    values.push(id);

    const updateQuery = `
      UPDATE announcement
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    const result = await executeQuery({ query: updateQuery, values });

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Announcement was not updated. It may not exist." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Announcement updated successfully",
      announcementId: id,
      status: status ?? null
    });
  } catch (err) {
    console.error("Failed to update announcement:", err);
    return NextResponse.json(
      { message: `Failed to update announcement: ${err.message}` },
      { status: 500 }
    );
  }
}

// Delete an announcement
export async function DELETE(request, context) {
  try {
    const { id } = context.params;

    // Delete announcement
    const deleteQuery = `DELETE FROM announcement WHERE id = ?`;
    await executeQuery({ query: deleteQuery, values: [id] });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}