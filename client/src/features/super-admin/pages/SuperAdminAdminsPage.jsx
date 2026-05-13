import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuperAdminAdminsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Oversight</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This page will list all admins across departments once wired to `/api/super/admins`.
      </CardContent>
    </Card>
  );
}
