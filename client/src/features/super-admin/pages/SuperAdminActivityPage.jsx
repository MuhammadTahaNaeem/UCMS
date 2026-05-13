import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuperAdminActivityPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Activity Log</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This page will render all complaint activity across departments from `/api/super/activity`.
      </CardContent>
    </Card>
  );
}
