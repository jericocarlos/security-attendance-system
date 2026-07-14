import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// PUT: Update an Existing Announcement
export async function PUT(req, context) {
  try {
    const { id } = context.params;
    let title;
    let announcement;
    let status;
    let attachmentFilename = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = formData.get('title');
      announcement = formData.get('announcement');
      status = formData.get('status');

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
      title = body.title;
      announcement = body.announcement;
      status = body.status;
    }

    const updateFields = [];
    const values = [];

    // Only include fields that are provided to avoid sending undefined to SQL
    if (typeof title !== 'undefined') {
      updateFields.push("title = ?");
      values.push(title ?? null);
    }

    if (typeof announcement !== 'undefined') {
      updateFields.push("announcement1 = ?");
      values.push(announcement ?? null);
    }

    if (typeof status !== 'undefined') {
      updateFields.push("status = ?");
      values.push(status ?? null);
    }

    // handle attachment if present
    if (typeof attachmentFilename !== 'undefined' && attachmentFilename !== null) {
      updateFields.push("attachment = ?");
      values.push(attachmentFilename);
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