"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AccountLoginList from './_components/AccountLoginList';
import DepartmentList from './_components/DepartmentList';
import PositionList from './_components/PositionList';
import SupervisorList from './_components/LeaderList';

export default function ListsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="logins">Account Logins</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="supervisors">Leaders</TabsTrigger>
        </TabsList>
        <TabsContent value="logins">
          <Card>
            <CardHeader>
              <CardTitle>Account Logins</CardTitle>
              <CardDescription>
                Manage all login accounts in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountLoginList />
            </CardContent>
          </Card>
        </TabsContent>
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
              <SupervisorList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}