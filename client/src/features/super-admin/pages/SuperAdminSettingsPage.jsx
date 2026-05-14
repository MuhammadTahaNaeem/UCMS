import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/apiClient";

export default function SuperAdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = React.useRef(null);

  const { data: settingsResponse } = useQuery({
    queryKey: ["super-admin", "settings"],
    queryFn: async () => {
      const response = await apiClient.get("/public/settings");
      return response.data;
    },
  });

  const settings = settingsResponse?.data;

  const [form, setForm] = useState({
    systemName: settings?.systemName || "University Complaint Management System",
    description: settings?.description || "",
    supportEmail: settings?.supportEmail || "",
  });
  const [logoFile, setLogoFile] = useState(null);

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.put("/super/settings", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "settings"] });
      toast({ title: "Settings updated", description: "System settings saved successfully." });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error?.response?.data?.message || "Unable to update settings.",
        variant: "destructive",
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("attachment", file);
      const response = await apiClient.post("/super/settings/logo", formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin", "settings"] });
      setLogoFile(null);
      if (fileRef.current) fileRef.current.value = "";
      toast({ title: "Logo uploaded", description: "System logo updated successfully." });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error?.response?.data?.message || "Unable to upload logo.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateSettings = () => {
    updateSettingsMutation.mutate({
      systemName: form.systemName,
      description: form.description,
      supportEmail: form.supportEmail,
    });
  };

  const handleUploadLogo = () => {
    if (!logoFile) {
      toast({ title: "No file", description: "Please select a logo file.", variant: "destructive" });
      return;
    }
    uploadLogoMutation.mutate(logoFile);
  };

  return (
    <PageShell title="System Settings" subtitle="SuperAdmin / Configure branding and system settings">
      <div className="grid gap-6">
        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">System Name</label>
              <Input
                value={form.systemName}
                onChange={(e) => setForm((f) => ({ ...f, systemName: e.target.value }))}
                placeholder="Enter system name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Enter system description (optional)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
                placeholder="support@university.edu"
                className="mt-1"
              />
            </div>
            <Button onClick={handleUpdateSettings} disabled={updateSettingsMutation.isPending}>
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings?.logo?.url && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Logo:</p>
                <img src={settings.logo.url} alt="Current logo" className="h-20 object-contain" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Upload New Logo</label>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="max-w-xs"
                />
                <Button
                  onClick={handleUploadLogo}
                  disabled={uploadLogoMutation.isPending || !logoFile}
                >
                  Upload Logo
                </Button>
              </div>
              {logoFile && <p className="text-sm text-muted-foreground mt-2">{logoFile.name}</p>}
              <p className="text-xs text-muted-foreground mt-3">Supported formats: JPG, PNG. Max size: 10MB</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
