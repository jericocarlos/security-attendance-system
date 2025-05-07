import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const query = `SELECT id, name FROM departments ORDER BY name ASC`;
    const departments = await executeQuery({ query });
    
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" }, 
      { status: 500 }
    );
  }
}