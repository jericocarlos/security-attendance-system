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
    const { id } = context.params;
    console.log("Route parameter ID:", id);
    const body = await req.json();
    const { ashima_id, name, department_id, position_id, rfid_tag, photo, emp_stat, status, removePhoto } = body;

    console.log("Updating employee ID:", id);
    console.log("Status:", status);
    console.log("Photo provided:", photo ? "Yes (photo data present)" : "No photo data");
    console.log("RFID tag:", rfid_tag || "None");
    console.log("Remove photo flag:", removePhoto ? "Yes" : "No");
    
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

    // Determine what to do with the photo
    let binaryPhoto;
    
    // Always set photo to NULL for resigned employees or if removePhoto flag is true
    if (status === "resigned" || removePhoto) {
      binaryPhoto = null;
      console.log("Photo will be removed due to resigned status or explicit removal request");
    } else if (photo) {
      // Only process photo if employee is not resigned and photo data was provided
      binaryPhoto = decodeBase64ToBinary(photo);
      console.log("Photo will be updated with new data");
    } else {
      // If no photo provided and not resigned, keep existing photo (don't update)
      console.log("No photo provided, existing photo will be preserved");
      // Exclude photo field from the update
      const existingPhoto = await executeQuery({ 
        query: "SELECT photo FROM employees WHERE id = ?", 
        values: [id] 
      });
      
      // If query returned results, use the existing photo
      if (existingPhoto && existingPhoto.length > 0) {
        binaryPhoto = existingPhoto[0].photo;
      } else {
        binaryPhoto = null;
      }
    }

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

    values.push(status === "resigned" || !rfid_tag ? null : rfid_tag);

    // Only include photo field if it's changing
    if (status === "resigned" || removePhoto || photo) {
      updateFields.push("photo = ?");
      values.push(binaryPhoto); // Will be null for resigned employees
    }

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
    console.log("Photo included in update:", (status === "resigned" || removePhoto || photo) ? "Yes" : "No");

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