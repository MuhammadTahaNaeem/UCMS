import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ProfileForm } from "@/features/user/components/ProfileForm";
import { useUpdateProfile } from "@/features/user/hooks/useUpdateProfile";
import { fetchUserProfile } from "@/features/user/userApi";
import { PageShell } from "@/components/shared/PageShell";

export default function StaffProfilePage() {
  const { toast } = useToast();
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: fetchUserProfile,
  });
  const updateProfileMutation = useUpdateProfile();

  const profile = profileResponse?.data;

  const handleSubmit = async (values) => {
    try {
      await updateProfileMutation.mutateAsync({
        fullName: values.fullName,
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error?.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageShell title="Profile" subtitle="Account Settings">
        <div className="py-12 text-center text-muted-foreground">Loading profile...</div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Profile" subtitle="Account Settings">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-xl border border-border shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Account Information</h2>
            <div className="mt-4 space-y-4">
              <InfoRow label="Full Name" value={profile?.fullName || "—"} />
              <InfoRow label="Email" value={profile?.email || "—"} />
              <InfoRow label="Phone" value={profile?.phone || "—"} />
              <InfoRow label="Role" value={profile?.role || "—"} />
            </div>
          </div>
        </Card>

        <ProfileForm
          defaultValues={{
            fullName: profile?.fullName || "",
            email: profile?.email || "",
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateProfileMutation.isPending}
        />
      </div>
    </PageShell>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
