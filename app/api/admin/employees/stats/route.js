import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["superadmin", "admin", "hr"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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
