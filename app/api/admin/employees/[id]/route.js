import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// Helper function to decode Base64 to binary with better error handling
function decodeBase64ToBinary(base64String) {
  if (!base64String || typeof base64String !== "string") {
    console.log("Invalid or missing base64String");
    return null;
  }
  try {
    const base64Data = base64String.includes("data:image")
      ? base64String.replace(/^data:image\/\w+;base64,/, "")
      : base64String;
    return Buffer.from(base64Data, "base64");
  } catch (error) {
    console.error("Error decoding base64 string:", error);
    return null;
  }
}

// PUT: Update an Existing Employee
export async function PUT(req, context) {
  try {
    const { id } = await context.params; // 👈 Add await here
    const body = await req.json();

    const {
      ashima_id,
      name,
      department_id,
      position_id,
      leader, // <-- use leader instead of supervisor_id
      rfid_tag,
      photo,
      emp_stat,
      status,
      removePhoto
    } = body;

    // Validate required fields
    if (!ashima_id || !name) {
      return NextResponse.json(
        { message: "Ashima ID and Name are required" },
        { status: 400 }
      );
    }

    let binaryPhoto = null;
    if (status === "resigned" || removePhoto) {
      binaryPhoto = null;
    } else if (photo) {
      binaryPhoto = decodeBase64ToBinary(photo);
    }

    const updateFields = [];
    const values = [];

    updateFields.push("ashima_id = ?");
    values.push(ashima_id);

    updateFields.push("name = ?");
    values.push(name);

    updateFields.push("department_id = ?");
    values.push(department_id);

    updateFields.push("position_id = ?");
    values.push(position_id);

    updateFields.push("leader = ?"); // <-- use leader
    values.push(leader || null);

    updateFields.push("rfid_tag = ?");
    values.push(status === "resigned" || !rfid_tag ? null : rfid_tag);

    if (status === "resigned" || removePhoto || photo) {
      updateFields.push("photo = ?");
      values.push(binaryPhoto);
    }

    updateFields.push("emp_stat = ?");
    values.push(emp_stat);

    updateFields.push("status = ?");
    values.push(status);

    values.push(id);

    const updateQuery = `
      UPDATE employees 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    const result = await executeQuery({ query: updateQuery, values });

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No employee was updated. The employee may not exist." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Employee updated successfully",
      employeeId: id,
      status: status,
      photoRemoved: status === "resigned" || removePhoto
    });
  } catch (err) {
    console.error("Failed to update employee:", err);
    return NextResponse.json(
      { message: `Failed to update employee: ${err.message}` },
      { status: 500 }
    );
  }
}