import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { PasswordInput } from "./PasswordInput";
import { resetPasswordSchema } from "@/features/auth/authSchemas";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import { useToast } from "@/components/ui/toast";

export function ResetPasswordForm({ token, onSuccess }) {
  const mutation = useResetPassword();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values) => {
    try {
      const data = await mutation.mutateAsync({ token, payload: values });
      toast({ title: "Password updated", description: data?.message || "Your password has been reset." });
      onSuccess?.(data);
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error?.response?.data?.message || "Unable to update your password.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="New Password" htmlFor="password" required error={form.formState.errors.password?.message}>
        <PasswordInput id="password" placeholder="Create a new password" autoComplete="new-password" {...form.register("password")} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Confirm Password" htmlFor="confirmPassword" required error={form.formState.errors.confirmPassword?.message}>
        <PasswordInput id="confirmPassword" placeholder="Re-enter the new password" autoComplete="new-password" {...form.register("confirmPassword")} />
      </FormFieldWrapper>

      <Button type="submit" className="w-full" disabled={mutation.isPending || form.formState.isSubmitting}>
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Reset password
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Back to login
        </Link>
      </div>
    </Form>
  );
}
