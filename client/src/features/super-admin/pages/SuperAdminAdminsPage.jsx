import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchSuperAdminAdmins } from "@/features/super-admin/superAdminApi";

const getDepartmentLabel = (department) => {
  if (!department) return "—";
  if (typeof department === "string") return department;
  return department.name || "—";
};

export function SuperAdminAdminsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["super-admin", "admins"],
    queryFn: fetchSuperAdminAdmins,
  });

  const admins = data?.data ?? [];
  const activeAdmins = admins.filter((admin) => admin.isActive !== false);
  const uniqueDepartments = new Set(admins.map((admin) => admin.department?._id || admin.department).filter(Boolean));

  return (
    <PageShell
      title="Admin Oversight"
      subtitle="SuperAdmin / View every admin across departments"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total admins</p>
            <div className="mt-1 text-2xl font-semibold">{admins.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active admins</p>
            <div className="mt-1 text-2xl font-semibold">{activeAdmins.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Departments covered</p>
            <div className="mt-1 text-2xl font-semibold">{uniqueDepartments.size}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableRowsSkeleton rows={5} />
            </div>
          ) : admins.length === 0 ? (
            <EmptyState
              title="No admins found"
              description="Admin accounts created for departments will appear here once available."
              cardClassName="rounded-none border-0"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>
                      <div className="font-medium">{admin.fullName}</div>
                      <div className="text-xs text-muted-foreground">{admin.role}</div>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{getDepartmentLabel(admin.department)}</TableCell>
                    <TableCell>
                      <StatusBadge status={admin.isActive === false ? "inactive" : "active"} />
                    </TableCell>
                    <TableCell>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
