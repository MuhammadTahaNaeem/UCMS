import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FilePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { complaintStatusOptions } from "@/features/user/constants";
import { ComplaintTable } from "@/features/user/components/ComplaintTable";
import { useUserComplaints } from "@/features/user/hooks/useUserComplaints";
import { normalizeStatus } from "@/features/user/utils";

export function ComplaintListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState("all");
  const [department, setDepartment] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const { data: complaintsResponse, isLoading } = useUserComplaints();
  const complaints = complaintsResponse?.data ?? [];

  const departments = [
    "all",
    ...new Set(complaints.map((item) => item.department?.name).filter(Boolean)),
  ];

  const mappedComplaints = complaints.map((item) => ({
    id: item._id,
    displayId: item.complaintId || item._id,
    title: item.title,
    department: item.department?.name || "—",
    status: normalizeStatus(item.status),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  const filteredComplaints = mappedComplaints.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesDepartment =
      department === "all" || item.department === department;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      item.displayId.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query);

    return matchesStatus && matchesDepartment && matchesSearch;
  });

  const handleEdit = (complaint) => {
    const source = complaints.find((item) => item._id === complaint.id);
    if (!source) return;
    navigate("/user/complaints/create", {
      state: {
        mode: "edit",
        complaint: {
          id: source._id,
          title: source.title,
          department: source.department?.name || "",
          description: source.description,
        },
      },
    });
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Complaint Management
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            My Complaints
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Filter, inspect, and manage all of your complaint requests from one
            place.
          </p>
        </div>
      </section>

      <Card className="rounded-2xl border border-border shadow-sm">
        <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-xl pl-10"
              placeholder="Search by ID or title"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {complaintStatusOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "all" ? "All departments" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <ComplaintTable
        complaints={filteredComplaints.map((item) => ({
          id: item.id,
          title: item.title,
          department: item.department,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))}
        isLoading={isLoading}
        onEdit={handleEdit}
        emptyState={{
          description: "No complaints match your current filters.",
          action: (
            <Button render={<Link to="/user/complaints/create" />}>
              <FilePlus className="size-4" />
              Create Complaint
            </Button>
          ),
        }}
      />
    </div>
  );
}
