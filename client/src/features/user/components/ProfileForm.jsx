import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { ProfileSchema } from "@/features/user/schemas";

export function ProfileForm({ defaultValues, onSubmit, isSubmitting = false, avatarUrl = "" }) {
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [selectedFileName, setSelectedFileName] = React.useState("");

  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: defaultValues ?? { fullName: "", email: "" },
  });

  const handleSubmit = (values) => {
    onSubmit({ ...values, avatar: avatarFile });
  };

  return (
    <Card className="rounded-xl border-border/70 shadow-sm">
      <div className="p-6">
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-background p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold text-foreground">Profile picture</p>
              <p className="text-xs text-muted-foreground">Upload a JPG or PNG image to display across your account.</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setAvatarFile(file);
                  setSelectedFileName(file?.name || "");
                }}
                className="mt-2 max-w-sm"
              />
              {selectedFileName ? <p className="text-xs text-muted-foreground">Selected file: {selectedFileName}</p> : null}
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
