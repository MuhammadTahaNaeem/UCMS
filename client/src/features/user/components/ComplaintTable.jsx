import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/features/user/components/StatusBadge";
import { formatDate } from "@/features/user/utils";
import { EmptyState, TableRowsSkeleton } from "@/components/shared";
import { ScrollArea } from "@/components/ui/scroll-area";

function ComplaintTableSkeleton() {
  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <div className="p-4 sm:p-6">
        <TableRowsSkeleton rows={5} />
      </div>
    </Card>
  );
}

export function ComplaintTable({ complaints = [], isLoading = false, emptyState, onEdit }) {
  const navigate = useNavigate();

  if (isLoading) {
    return <ComplaintTableSkeleton />;
  }

  if (!complaints.length) {
    return (
      <Card className="rounded-2xl border border-border shadow-sm">
        <EmptyState
          title="No complaints found"
          description={emptyState?.description || "Create your first complaint to get started."}
          action={emptyState?.action}
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <ScrollArea className="w-full whitespace-nowrap">
        <Table className="min-w-230">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Department</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last Updated</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint.id} className="group border-border transition-colors hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-muted-foreground">{complaint.id}</TableCell>
                <TableCell className="border-t border-border max-w-70 truncate text-foreground">{complaint.title}</TableCell>
                <TableCell className="border-t border-border text-muted-foreground">{complaint.department || "—"}</TableCell>
                <TableCell className="border-t border-border text-muted-foreground">{formatDate(complaint.createdAt)}</TableCell>
                <TableCell className="border-t border-border text-muted-foreground">{formatDate(complaint.updatedAt)}</TableCell>
                <TableCell className="border-t border-border"><StatusBadge status={complaint.status} /></TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Open actions for ${complaint.title}`} className="rounded-full" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-2xl border-border p-2">
                      <DropdownMenuItem onSelect={() => navigate(`/user/complaints/${complaint.id}`)} className="rounded-xl px-3 py-2">
                        <Eye className="size-4" />
                        View
                      </DropdownMenuItem>
                      {complaint.status === "Pending" ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => onEdit?.(complaint)} className="rounded-xl px-3 py-2">
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
