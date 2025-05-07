import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Query to fetch all departments
    const query = "SELECT id, name FROM departments ORDER BY name ASC";
    const departments = await executeQuery({ query });

    // Return the departments as JSON
    return NextResponse.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);

    // Return an error response
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}