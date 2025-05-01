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
    const { ashima_id, name, department, position, rfid_tag, photo, emp_stat, status } = body;

    console.log("Updating employee photo status:", photo ? "Photo provided" : "No photo provided");
    
    // Validate required fields
    if (!ashima_id || !name || !rfid_tag) {
      return NextResponse.json(
        { message: "Ashima ID, Name, and RFID Tag are required" },
        { status: 400 }
      );
    }

    // Decode Base64 photo to binary, if provided
    const binaryPhoto = photo ? decodeBase64ToBinary(photo) : null;

    // Build the update query dynamically
    const updateFields = [
      "ashima_id = ?",
      "name = ?",
      "department = ?",
      "position = ?",
      "rfid_tag = ?",
      "photo = ?",
      "emp_stat = ?",
      "status = ?",
    ];
    const values = [ashima_id, name, department, position, rfid_tag, binaryPhoto, emp_stat, status];

    values.push(id); // Add ID to the query values

    const updateQuery = `
      UPDATE employees 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    await executeQuery({ query: updateQuery, values });

    return NextResponse.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Failed to update employee:", err);
    return NextResponse.json(
      { message: "Failed to update employee" },
      { status: 500 }
    );
  }
}