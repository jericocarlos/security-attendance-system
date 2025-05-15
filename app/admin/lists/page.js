"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DepartmentList from './_components/DepartmentList';
import PositionList from './_components/PositionList';

export default function ListsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
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
      </Tabs>
    </div>
  );
}