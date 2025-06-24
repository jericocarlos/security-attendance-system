import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  // Check authentication
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Get total employees
    const employeesQuery = `SELECT COUNT(*) as count FROM employees WHERE status = 'active'`;
    const employeesResult = await executeQuery({ query: employeesQuery });
    const totalEmployees = employeesResult[0].count;

    // Get total departments
    const departmentsQuery = `SELECT COUNT(*) as count FROM departments`;
    const departmentsResult = await executeQuery({ query: departmentsQuery });
    const departments = departmentsResult[0].count;

    // Get today's attendance count
    const todayQuery = `
      SELECT COUNT(*) as count 
      FROM attendance_logs 
      WHERE DATE(timestamp) = CURDATE()
    `;
    const todayResult = await executeQuery({ query: todayQuery });
    const todayAttendance = todayResult[0].count;

    // Get total attendance count
    const totalQuery = `SELECT COUNT(*) as count FROM attendance_logs`;
    const totalResult = await executeQuery({ query: totalQuery });
    const totalAttendance = totalResult[0].count;

    return NextResponse.json({
      totalEmployees,
      departments,
      todayAttendance,
      totalAttendance
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}