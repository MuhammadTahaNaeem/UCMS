import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { ProfileSchema } from "@/features/user/schemas";

export function ProfileForm({ defaultValues, onSubmit, isSubmitting = false, avatarUrl = "" }) {
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(avatarUrl || "");

  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: defaultValues ?? { fullName: "", email: "" },
  });

  React.useEffect(() => {
    setPreviewUrl(avatarUrl || "");
  }, [avatarUrl]);

  React.useEffect(() => {
    if (!avatarFile) return undefined;

    const objectUrl = URL.createObjectURL(avatarFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleSubmit = (values) => {
    onSubmit({ ...values, avatar: avatarFile });
  };

  return (
    <Card className="rounded-xl border-border/70 shadow-sm">
      <div className="p-6">
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-background p-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={previewUrl} alt={form.watch("fullName") || "Profile picture"} />
              <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                {(form.watch("fullName") || "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold text-foreground">Profile picture</p>
              <p className="text-xs text-muted-foreground">Upload a JPG or PNG image to display across your account.</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                className="mt-2 max-w-sm"
              />
            </div>
          </div>

          <FormFieldWrapper label="Full Name" htmlFor="fullName" required error={form.formState.errors.fullName?.message}>
            <Input id="fullName" placeholder="Your full name" {...form.register("fullName")} />
          </FormFieldWrapper>

          <FormFieldWrapper label="Email" htmlFor="email" required error={form.formState.errors.email?.message} hint="Email is managed by the system and typically read-only.">
            <Input id="email" type="email" readOnly placeholder="name@university.edu" {...form.register("email")} />
          </FormFieldWrapper>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
              {isSubmitting || form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
