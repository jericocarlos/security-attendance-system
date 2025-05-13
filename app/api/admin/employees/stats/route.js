import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const activeQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'active'`;
    const inactiveQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'inactive'`;
    const resignedQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'resigned'`;

    const [activeResult] = await executeQuery({ query: activeQuery });
    const [inactiveResult] = await executeQuery({ query: inactiveQuery });
    const [resignedResult] = await executeQuery({ query: resignedQuery });

    return NextResponse.json({
      active: activeResult.total,
      inactive: inactiveResult.total,
      resigned: resignedResult.total,
    });
  } catch (error) {
    console.error("Failed to fetch employee stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee stats" },
      { status: 500 }
    );
  }
}