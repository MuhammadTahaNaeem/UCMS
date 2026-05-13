import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ComplaintForm } from "@/features/user/components/ComplaintForm";
import { useCreateComplaint } from "@/features/user/hooks/useCreateComplaint";
import { useUpdateComplaint } from "@/features/user/hooks/useUpdateComplaint";

export function CreateComplaintPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const createMutation = useCreateComplaint();
  const updateMutation = useUpdateComplaint();

  const existingComplaint = location.state?.complaint;
  const isEditMode = location.state?.mode === "edit" && Boolean(existingComplaint?.id);

  const defaultValues = {
    title: existingComplaint?.title ?? "",
    department: existingComplaint?.department ?? "",
    description: existingComplaint?.description ?? "",
    attachment: undefined,
  };

  const handleSubmit = async (payload) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: existingComplaint.id,
          payload,
        });

        toast({
          title: "Complaint updated",
          description: "Your complaint has been updated successfully.",
        });

        navigate(`/user/complaints/${existingComplaint.id}`, { replace: true });
        return;
      }

      const response = await createMutation.mutateAsync(payload);
      const createdId = response?.data?._id;

      toast({
        title: "Complaint submitted",
        description: "Your complaint has been created successfully.",
      });

      if (createdId) {
        navigate(`/user/complaints/${createdId}`, { replace: true });
      } else {
        navigate("/user/complaints", { replace: true });
      }
    } catch (error) {
      toast({
        title: isEditMode ? "Update failed" : "Submission failed",
        description: error?.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">Complaint Management</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isEditMode ? "Edit Complaint" : "Create Complaint"}
        </h1>
      </section>

      <ComplaintForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        submitLabel={isEditMode ? "Update Complaint" : "Submit Complaint"}
        secondaryAction={
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />
    </div>
  );
}
