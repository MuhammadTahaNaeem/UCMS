import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { createSuperDepartmentAdmin, fetchAllDepartments, fetchSuperAdminAdmins } from "@/features/super-admin/superAdminApi";

export default function SuperAdminDepartmentAdminsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adminsData, isLoading: adminsLoading } = useQuery({
    queryKey: ["super-admin", "admins"],
    queryFn: fetchSuperAdminAdmins,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["super-admin", "departments"],
    queryFn: fetchAllDepartments,
  });

  const admins = adminsData?.data ?? [];
  const departments = departmentsData?.data ?? [];

  const [form, setForm] = React.useState({ fullName: "", email: "", password: "", department: "" });

  const mutation = useMutation({
    mutationFn: createSuperDepartmentAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "admins"] });
      toast({ title: "Department admin created", description: "The admin was added successfully." });
      setForm({ fullName: "", email: "", password: "", department: "" });
    },
    onError: (error) => {
      toast({
        title: "Create failed",
        description: error?.response?.data?.message || "Unable to create department admin.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim() || !form.department) {
      toast({ title: "Missing fields", description: "Provide name, email, password and department.", variant: "destructive" });
      return;
    }

    mutation.mutate({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      department: form.department,
    });
  };

  return (
    <PageShell title="Department Admins" subtitle="SuperAdmin / Create admin users for departments">
      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Create department admin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <Select value={form.department || "all"} onValueChange={(value) => setForm((f) => ({ ...f, department: value === "all" ? "" : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select department</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department._id} value={department._id}>{department.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3">
            <Button onClick={handleSubmit} disabled={mutation.isPending}>Create department admin</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Existing admins</CardTitle>
        </CardHeader>
        <CardContent>
          {adminsLoading ? (
            <TableRowsSkeleton rows={4} />
          ) : admins.length === 0 ? (
            <EmptyState title="No admins" description="Create department admins to assign complaints." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>{admin.fullName}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.department?.name || "—"}</TableCell>
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
