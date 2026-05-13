import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuperAdminDashboardPage() {
  const cards = [
    { label: "Platform Role", value: "SuperAdmin", description: "Global oversight access" },
    { label: "Scope", value: "All Departments", description: "View every admin and complaint" },
    { label: "Activity", value: "Live", description: "Socket-driven global stream" },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SuperAdmin Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Central oversight for admins, complaint activity, and promotions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{card.value}</div>
              <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next actions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect this dashboard to the `/api/super/admins` and `/api/super/activity` endpoints to render live data.
        </CardContent>
      </Card>
    </div>
  );
}
