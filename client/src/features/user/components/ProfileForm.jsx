import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { ProfileSchema } from "@/features/user/schemas";

export function ProfileForm({ defaultValues, onSubmit, isSubmitting = false }) {
  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: defaultValues ?? { fullName: "", email: "" },
  });

  return (
    <Card className="rounded-xl border-border/70 shadow-sm">
      <div className="p-6">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
