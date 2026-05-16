import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useUpdateProfile } from "@/features/user/hooks/useUpdateProfile";
import { fetchUserProfile } from "@/features/user/userApi";
import { userQueryKeys } from "@/features/user/userQueryKeys";
import { PageShell } from "@/components/shared/PageShell";

export default function AdminProfilePage() {
  const { toast } = useToast();
  const fileInputRef = React.useRef(null);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: [...userQueryKeys.profile, "admin"],
    queryFn: fetchUserProfile,
  });
  const updateProfileMutation = useUpdateProfile();

  const profile = profileResponse?.data;

  const handleUpload = async () => {
    if (!avatarFile) {
      toast({
        title: "No file selected",
        description: "Please choose a profile picture first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: profile?.fullName || "",
        avatar: avatarFile,
      });
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({ title: "Profile updated", description: "Your profile picture has been updated successfully." });
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
      <Card className="rounded-xl border border-border shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Account Information</h2>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border/70 bg-background p-6 text-center sm:flex-row sm:text-left">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={profile?.avatar?.url} alt={profile?.fullName} />
                <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
                  {(profile?.fullName || "U").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-semibold text-foreground">Profile picture</p>
                <p className="text-xs text-muted-foreground">Upload a JPG or PNG image to display across your account.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                    className="max-w-sm"
                  />
                  <Button onClick={handleUpload} disabled={updateProfileMutation.isPending || !avatarFile}>
                    Save picture
                  </Button>
                </div>
                {avatarFile ? <p className="text-xs text-muted-foreground">Selected file: {avatarFile.name}</p> : null}
              </div>
            </div>

            <InfoRow label="Full Name" value={profile?.fullName || "—"} />
            <InfoRow label="Email" value={profile?.email || "—"} />
            <InfoRow label="Phone" value={profile?.phone || "—"} />
            <InfoRow label="Role" value={profile?.role || "—"} />
          </div>
        </div>
      </Card>
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
