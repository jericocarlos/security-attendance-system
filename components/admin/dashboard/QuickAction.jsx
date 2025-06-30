/**
 * Quick Action Component
 * Displays a call-to-action card for attendance logs (conditionally rendered)
 */
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QuickAction({ hasAttendanceAccess }) {
  if (!hasAttendanceAccess) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      role="region"
      aria-label="Quick actions"
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">Need to view attendance records?</h3>
              <p className="text-gray-500">Access detailed attendance logs to monitor employee attendance</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              asChild
              aria-label="Navigate to attendance logs page"
            >
              <Link href="/admin/attendance-logs">
                View Attendance Logs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
