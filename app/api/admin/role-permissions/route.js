import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { executeQuery } from "@/lib/db";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Get all role permissions - all authenticated users can view permissions
    // for navigation and access control purposes
    const permissions = await executeQuery({
      query: `
        SELECT 
          id,
          role,
          module,
          permission,
          created_at,
          updated_at
        FROM role_permissions 
        ORDER BY 
          FIELD(role, 'superadmin', 'admin', 'security', 'hr'),
          module
      `
    });

    // Parse JSON permissions
    const formattedPermissions = permissions.map(perm => ({
      ...perm,
      permission: JSON.parse(perm.permission)
    }));

    return Response.json({ permissions: formattedPermissions });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return Response.json({ error: "Failed to fetch role permissions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'superadmin') {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { role, module, permission } = await request.json();

    if (!role || !module || !permission) {
      return Response.json({ error: "Role, module, and permission are required" }, { status: 400 });
    }

    // Insert or update role permission
    await executeQuery({
      query: `
        INSERT INTO role_permissions (role, module, permission) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        permission = VALUES(permission),
        updated_at = CURRENT_TIMESTAMP
      `,
      values: [role, module, JSON.stringify(permission)]
    });

    return Response.json({ message: "Role permission updated successfully" });
  } catch (error) {
    console.error('Error updating role permission:', error);
    return Response.json({ error: "Failed to update role permission" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'superadmin') {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { permissions } = await request.json();

    if (!permissions || !Array.isArray(permissions)) {
      return Response.json({ error: "Permissions array is required" }, { status: 400 });
    }

    // Batch update permissions
    for (const perm of permissions) {
      await executeQuery({
        query: `
          INSERT INTO role_permissions (role, module, permission) 
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          permission = VALUES(permission),
          updated_at = CURRENT_TIMESTAMP
        `,
        values: [perm.role, perm.module, JSON.stringify(perm.permission)]
      });
    }

    return Response.json({ message: "Bulk permissions updated successfully" });
  } catch (error) {
    console.error('Error bulk updating permissions:', error);
    return Response.json({ error: "Failed to update permissions" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'superadmin') {
      return Response.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const moduleName = searchParams.get('module');

    if (!role || !moduleName) {
      return Response.json({ error: "Role and module are required" }, { status: 400 });
    }

    await executeQuery({
      query: `DELETE FROM role_permissions WHERE role = ? AND module = ?`,
      values: [role, moduleName]
    });

    return Response.json({ message: "Role permission deleted successfully" });
  } catch (error) {
    console.error('Error deleting role permission:', error);
    return Response.json({ error: "Failed to delete role permission" }, { status: 500 });
  }
}
