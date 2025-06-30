import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Users } from "lucide-react";
import { ROLES, MODULES } from './constants';
import { calculateRoleStats, getModuleInfo } from './utils';

/**
 * Role overview cards component
 * @param {Object} props - Component props  
 * @param {Array} props.permissions - Array of all permissions
 * @param {boolean} props.loading - Loading state
 */
export default function RoleOverviewCards({ permissions = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map(role => (
          <Card key={role.value} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="space-y-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-3 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {ROLES.map(role => {
        const stats = calculateRoleStats(permissions, role.value);
        const rolePermissions = permissions.filter(p => p.role === role.value);

        return (
          <Card key={role.value} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <Badge 
                  className={`${role.color} text-white`}
                  title={role.description}
                >
                  <Users className="h-3 w-3 mr-1" aria-hidden="true" />
                  {role.label}
                </Badge>
                <span className="text-sm font-normal text-muted-foreground">
                  {stats.accessPercentage}%
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Statistics */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Module Access</span>
                    <span className="font-medium">
                      {stats.accessibleModules} of {MODULES.length}
                    </span>
                  </div>
                  <Progress 
                    value={stats.accessPercentage} 
                    className="h-2"
                    aria-label={`${role.label} has access to ${stats.accessPercentage}% of modules`}
                  />
                </div>

                {/* Module List */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Configured Modules
                  </h4>
                  {rolePermissions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No modules configured
                    </p>
                  ) : (
                    rolePermissions.map(perm => {
                      const moduleInfo = getModuleInfo(perm.module);
                      const hasAccess = perm.permission.access;
                      
                      return (
                        <div 
                          key={perm.module} 
                          className="flex items-center gap-2 text-sm"
                          title={moduleInfo?.description}
                        >
                          {hasAccess ? (
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" aria-hidden="true" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" aria-hidden="true" />
                          )}
                          <span 
                            className={`${hasAccess ? 'text-foreground' : 'text-muted-foreground line-through'} truncate`}
                          >
                            {moduleInfo?.label || perm.module}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Unconfigured modules */}
                {rolePermissions.length < MODULES.length && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Unconfigured Modules
                    </h4>
                    {MODULES
                      .filter(module => !rolePermissions.some(p => p.module === module.value))
                      .map(module => (
                        <div 
                          key={module.value} 
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                          title={module.description}
                        >
                          <div className="h-3 w-3 rounded-full bg-gray-300 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{module.label}</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
