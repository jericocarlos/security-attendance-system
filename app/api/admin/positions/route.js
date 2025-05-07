import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Query to fetch all positions
    const query = "SELECT id, name FROM positions ORDER BY name ASC";
    const positions = await executeQuery({ query });

    // Return the positions as JSON
    return NextResponse.json(positions);
  } catch (err) {
    console.error("Error fetching positions:", err);

    // Return an error response
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}