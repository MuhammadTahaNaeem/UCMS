import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSelector } from "react-redux";
import {
  fetchStaffMembers,
  fetchDepartments,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
} from "@/features/admin/adminApi";
import { adminQueryKeys } from "@/features/admin/adminQueryKeys";
import { useToast } from "@/components/ui/toast";

export default function StaffManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authUser = useSelector((state) => state.auth.user);
  const authRole = useSelector((state) => state.auth.role);

  const { data: staffResponse, isLoading } = useQuery({
    queryKey: adminQueryKeys.staff,
    queryFn: fetchStaffMembers,
  });

  const { data: departmentResponse } = useQuery({
    queryKey: adminQueryKeys.departments,
    queryFn: fetchDepartments,
  });

  const staff = staffResponse?.data ?? [];
  const departments = departmentResponse?.data ?? [];
  const selectedDepartmentName = authUser?.department?.name || authUser?.department?.code || "Your department";
  const visibleDepartments = authRole === "Admin" && authUser?.department?._id
    ? departments.filter((department) => department._id === authUser.department._id)
    : departments;

  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    department: "",
    phone: "",
    password: "",
  });
  const [editingId, setEditingId] = React.useState(null);
  const selectedFormDepartmentName = React.useMemo(() => {
    if (!form.department) return "Select department";
    return departments.find((department) => department._id === form.department)?.name || "Select department";
  }, [departments, form.department]);

  const resetForm = React.useCallback(() => {
    setForm({ fullName: "", email: "", department: "", phone: "", password: "" });
    setEditingId(null);
  }, []);

  const refreshStaff = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.staff });
  };

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      refreshStaff();
      toast({ title: "Staff added", description: "Staff member created successfully." });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Create failed",
        description: error?.response?.data?.message || "Unable to create staff.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStaff(id, payload),
    onSuccess: () => {
      refreshStaff();
      toast({ title: "Staff updated", description: "Staff member updated successfully." });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error?.response?.data?.message || "Unable to update staff.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      refreshStaff();
      toast({ title: "Staff removed", description: "Staff member deleted.", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleStaffStatus,
    onSuccess: () => {
      refreshStaff();
      toast({ title: "Status changed", description: "Staff status updated." });
    },
  });

  const handleCreateOrUpdate = () => {
    if (!form.fullName || !form.email) {
      toast({ title: "Missing fields", description: "Provide name and email." });
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        payload: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          department: authRole === "Admin" ? authUser?.department?._id : form.department || undefined,
        },
      });
      return;
    }

    if (!form.password || form.password.length < 6) {
      toast({ title: "Invalid password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      department: authRole === "Admin" ? authUser?.department?._id : form.department || undefined,
      password: form.password,
    });
  };

  const handleEdit = (staffMember) => {
    setEditingId(staffMember._id);
    setForm({
      fullName: staffMember.fullName || "",
      email: staffMember.email || "",
      department: staffMember.department?._id || "",
      phone: staffMember.phone || "",
      password: "",
    });
  };

  return (
    <PageShell title="Staff Management" subtitle="Admin / Manage staff members">
      <Card className="rounded-xl border border-border shadow-sm">
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">{editingId ? "Edit staff" : "Add new staff"}</h3>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Role fixed: Staff only</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            {authRole === "Admin" && authUser?.department?._id ? (
              <Input value={selectedDepartmentName} disabled aria-label="Assigned department" />
            ) : (
              <Select
                value={form.department || undefined}
                onValueChange={(value) => setForm((f) => ({ ...f, department: value === "all" ? "" : value }))}
              >
                <SelectTrigger className="w-full">
                  <span className={form.department ? "text-foreground" : "text-muted-foreground"}>
                    {selectedFormDepartmentName}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select department</SelectItem>
                  {visibleDepartments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            {!editingId ? <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={handleCreateOrUpdate} disabled={createMutation.isPending || updateMutation.isPending}>{editingId ? "Update" : "Add"}</Button>
            {editingId ? <Button variant="ghost" onClick={resetForm}>Cancel</Button> : null}
          </div>
        </div>
        <div>
          {isLoading ? (
            <div className="p-4">
              <TableRowsSkeleton rows={5} />
            </div>
          ) : staff.length === 0 ? (
            <EmptyState
              title="No staff members"
              description="Add staff members to start assigning approved complaints."
            />
          ) : (
          <ScrollArea className="w-full whitespace-nowrap">
          <Table className="min-w-220">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{s._id}</TableCell>
                    <TableCell>{s.fullName}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.department?.name || "—"}</TableCell>
                    <TableCell className="capitalize">
                      {s.isActive ? (
                        <Badge variant="secondary">active</Badge>
                      ) : (
                        <Badge variant="destructive">inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Open actions" />}>
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onSelect={() => handleEdit(s)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => toggleMutation.mutate(s._id)}>
                            {s.isActive ? "Set Inactive" : "Set Active"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => deleteMutation.mutate(s._id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          </ScrollArea>
          )}
        </div>
      </Card>
    </PageShell>
  );
}
