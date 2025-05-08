import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// Helper function to decode Base64 to binary with better error handling
function decodeBase64ToBinary(base64String) {
  if (!base64String || typeof base64String !== "string") {
    console.log("Invalid or missing base64String");
    return null;
  }
  
  try {
    // Handle both formats: with data:image prefix and without
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
    const { id } = await context.params;
    const body = await req.json();
    const { ashima_id, name, department_id, position_id, rfid_tag, photo, emp_stat, status } = body;

    console.log("Updating employee ID:", id);
    console.log("Status:", status);
    console.log("Photo provided:", photo ? "Yes (photo data present)" : "No photo data");
    console.log("RFID tag:", rfid_tag || "None");
    
    // Validate required fields - only ashima_id and name are always required
    if (!ashima_id || !name) {
      return NextResponse.json(
        { message: "Ashima ID and Name are required" },
        { status: 400 }
      );
    }
    
    // Check if RFID tag is required (only for active employees)
    if (status !== "resigned" && !rfid_tag) {
      return NextResponse.json(
        { message: "RFID Tag is required for active employees" },
        { status: 400 }
      );
    }

    // Decode Base64 photo to binary, if provided
    const binaryPhoto = photo ? decodeBase64ToBinary(photo) : null;

    // Build the update query dynamically with proper handling of NULL values
    const updateFields = [];
    const values = [];

    // Add fields to update
    updateFields.push("ashima_id = ?");
    values.push(ashima_id);

    updateFields.push("name = ?");
    values.push(name);

    updateFields.push("department_id = ?");
    values.push(department_id);

    updateFields.push("position_id = ?");
    values.push(position_id);

    updateFields.push("rfid_tag = ?");
    values.push(rfid_tag); // Will be null for resigned employees

    updateFields.push("photo = ?");
    values.push(binaryPhoto); // Will be null for resigned employees

    updateFields.push("emp_stat = ?");
    values.push(emp_stat);

    updateFields.push("status = ?");
    values.push(status);

    // Add ID for WHERE clause
    values.push(id);

    const updateQuery = `
      UPDATE employees 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    // Log the query and values (without photo data)
    console.log("Update query:", updateQuery);
    console.log("Update values (partial):", [
      ashima_id, name, department_id, position_id, rfid_tag, 
      binaryPhoto ? "[Binary photo data]" : null,
      emp_stat, status, id
    ]);

    const result = await executeQuery({ query: updateQuery, values });
    console.log("Database update result:", result);

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No employee was updated. The employee may not exist." },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Employee updated successfully",
      employeeId: id,
      status: status
    });
  } catch (err) {
    console.error("Failed to update employee:", err);
    return NextResponse.json(
      { message: `Failed to update employee: ${err.message}` },
      { status: 500 }
    );
  }
}