import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/shared/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, StatusBadge, TableRowsSkeleton } from "@/components/shared";
import { fetchAllComplaints, fetchStaffMembers, assignComplaint } from "@/features/admin/adminApi";
import { adminQueryKeys } from "@/features/admin/adminQueryKeys";
import { formatDate } from "@/features/user/utils";
import { useToast } from "@/components/ui/toast";

export default function AdminAssignmentBoardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedStaffByComplaint, setSelectedStaffByComplaint] = React.useState({});

  const { data: complaintsResponse = {}, isLoading: complaintsLoading, error: complaintsError } = useQuery({
    queryKey: adminQueryKeys.complaints,
    queryFn: fetchAllComplaints,
  });

  const { data: staffResponse = {}, isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: adminQueryKeys.staff,
    queryFn: fetchStaffMembers,
  });

  const complaints = complaintsResponse?.data ?? [];
  const staff = staffResponse?.data ?? [];

  const assignMutation = useMutation({
    mutationFn: ({ complaintId, staffId }) => assignComplaint(complaintId, { staffId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.complaints });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.complaintsPending });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.complaintDetail });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
      toast({ title: "Assigned", description: "Complaint assigned to staff member." });
    },
    onError: (error) => {
      toast({
        title: "Assign failed",
        description: error?.response?.data?.message || "Unable to assign complaint.",
        variant: "destructive",
      });
    },
  });

  const assignableComplaints = complaints.filter((complaint) => ["approved", "in_progress"].includes(complaint.status));
  const assignedComplaints = complaints.filter((complaint) => complaint.assignedTo);

  const getStaffForDepartment = (departmentId) => {
    if (!departmentId) return staff;
    return staff.filter((member) => member.department?._id === departmentId || member.department === departmentId);
  };

  if (complaintsLoading || staffLoading) {
    return (
      <PageShell title="Assignment Board" subtitle="Admin / Assign complaints to staff">
        <Card className="rounded-xl border border-border shadow-sm p-4">
          <TableRowsSkeleton rows={5} />
        </Card>
      </PageShell>
    );
  }

  if (complaintsError || staffError) {
    return (
      <PageShell title="Assignment Board" subtitle="Admin / Assign complaints to staff">
        <Card className="rounded-xl border border-border shadow-sm">
          <div className="py-8 text-center text-destructive">Error loading assignment board</div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Assignment Board" subtitle="Admin / Assign complaints to staff">
      <Tabs defaultValue="assign">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="assign">Assign Staff</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="mt-4">
          <Card className="rounded-xl border border-border shadow-sm">
            {assignableComplaints.length === 0 ? (
              <EmptyState title="No complaints ready for assignment" description="Approved complaints will appear here after review." />
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staff</TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignableComplaints.map((complaint) => {
                      const complaintStaff = getStaffForDepartment(complaint.department?._id);
                      const selectedStaffId = selectedStaffByComplaint[complaint._id] || "";

                      return (
                        <TableRow key={complaint._id} className="border-border">
                          <TableCell>
                            <div className="font-medium text-foreground">{complaint.title}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(complaint.createdAt)}</div>
                          </TableCell>
                          <TableCell>{complaint.department?.name || "—"}</TableCell>
                          <TableCell><StatusBadge status={complaint.status} /></TableCell>
                          <TableCell>
                            <Select
                              value={selectedStaffId}
                              onValueChange={(value) => setSelectedStaffByComplaint((prev) => ({ ...prev, [complaint._id]: value }))}
                            >
                              <SelectTrigger className="w-full max-w-xs">
                                <SelectValue placeholder="Select staff" />
                              </SelectTrigger>
                              <SelectContent>
                                {complaintStaff.map((member) => (
                                  <SelectItem key={member._id} value={member._id}>
                                    {member.fullName} — {member.department?.name || "N/A"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                if (!selectedStaffId) {
                                  toast({ title: "Staff required", description: "Select a staff member first.", variant: "destructive" });
                                  return;
                                }
                                assignMutation.mutate({ complaintId: complaint._id, staffId: selectedStaffId });
                              }}
                              disabled={assignMutation.isPending}
                            >
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="mt-4">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Assigned Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedComplaints.length === 0 ? (
                <EmptyState title="No assigned complaints" description="Assigned complaints will appear here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assigned Staff</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedComplaints.map((complaint) => (
                      <TableRow key={complaint._id} className="border-border">
                        <TableCell>{complaint.title}</TableCell>
                        <TableCell>{complaint.department?.name || "—"}</TableCell>
                        <TableCell>{complaint.assignedTo?.fullName || "—"}</TableCell>
                        <TableCell><StatusBadge status={complaint.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}