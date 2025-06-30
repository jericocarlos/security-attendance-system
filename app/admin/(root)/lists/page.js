"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentList, PositionList, LeaderList } from '@/components/admin/lists';

export default function ListsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="supervisors">Leaders</TabsTrigger>
        </TabsList>
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>
                Manage all departments in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Positions</CardTitle>
              <CardDescription>
                Manage all job positions in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PositionList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="supervisors">
          <Card>
            <CardHeader>
              <CardTitle>Leaders</CardTitle>
              <CardDescription>
                Manage leaders in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}