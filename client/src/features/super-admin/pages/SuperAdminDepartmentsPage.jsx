import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/shared/PageShell";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { createSuperDepartment, fetchAllDepartments } from "@/features/super-admin/superAdminApi";

export default function SuperAdminDepartmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["super-admin", "departments"], queryFn: fetchAllDepartments });

  const departments = data?.data ?? [];
  const [form, setForm] = React.useState({ name: "", code: "", description: "" });

  const mutation = useMutation({
    mutationFn: createSuperDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "departments"] });
      toast({ title: "Department created", description: "The new department was added successfully." });
      setForm({ name: "", code: "", description: "" });
    },
    onError: (error) => {
      toast({
        title: "Create failed",
        description: error?.response?.data?.message || "Unable to create department.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ title: "Missing name", description: "Department name is required.", variant: "destructive" });
      return;
    }

    mutation.mutate({
      name: form.name,
      code: form.code || undefined,
      description: form.description || undefined,
    });
  };

  return (
    <PageShell title="Departments" subtitle="SuperAdmin / Create and review departments">
      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Create department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Department name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Department code (optional)" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="mt-3">
            <Button onClick={handleSubmit} disabled={mutation.isPending}>Create department</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <CardTitle>All departments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableRowsSkeleton rows={4} />
          ) : departments.length === 0 ? (
            <EmptyState title="No departments" description="Create the first department to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department._id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>{department.description || "—"}</TableCell>
                    <TableCell>{department.isActive ? "Active" : "Inactive"}</TableCell>
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
