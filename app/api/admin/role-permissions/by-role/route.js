import { executeQuery } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    if (!role) {
      return Response.json({ error: "Role parameter is required" }, { status: 400 });
    }

    // Get permissions for the specific role
    const permissions = await executeQuery({
      query: `
        SELECT 
          module,
          permission
        FROM role_permissions 
        WHERE role = ?
      `,
      values: [role]
    });

    // Parse JSON permissions
    const formattedPermissions = permissions.map(perm => ({
      ...perm,
      permission: JSON.parse(perm.permission)
    }));

    return Response.json({ permissions: formattedPermissions });
  } catch (error) {
    console.error('Error fetching role permissions by role:', error);
    return Response.json({ error: "Failed to fetch role permissions" }, { status: 500 });
  }
}
