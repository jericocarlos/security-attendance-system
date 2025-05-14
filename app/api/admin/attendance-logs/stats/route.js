import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET() {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_logs,
        SUM(CASE WHEN log_type = 'IN' THEN 1 ELSE 0 END) AS total_in,
        SUM(CASE WHEN log_type = 'OUT' THEN 1 ELSE 0 END) AS total_out
      FROM attendance_logs
    `;

    const stats = await executeQuery({ query });
    return NextResponse.json(stats[0]);
  } catch (error) {
    console.error("Failed to fetch attendance stats:", error);
    return NextResponse.json({ error: "Failed to fetch attendance stats" }, { status: 500 });
  }
}