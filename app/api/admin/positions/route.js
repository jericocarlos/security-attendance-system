import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const query = `SELECT id, name FROM positions ORDER BY name ASC`;
    const positions = await executeQuery({ query });
    
    return NextResponse.json({ positions });
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" }, 
      { status: 500 }
    );
  }
}