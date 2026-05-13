import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { forgotPasswordSchema } from "@/features/auth/authSchemas";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { useToast } from "@/components/ui/toast";

export function ForgotPasswordForm({ onSuccess }) {
  const mutation = useForgotPassword();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values) => {
    try {
      const data = await mutation.mutateAsync(values);
      toast({ title: "Email sent", description: data?.message || "Password reset link sent to your email." });
      onSuccess?.(values.email, data);
    } catch (error) {
      toast({
        title: "Request failed",
        description: error?.response?.data?.message || "Unable to send the reset link.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="Email" htmlFor="email" required error={form.formState.errors.email?.message} hint="We will send a reset link to this address.">
        <Input id="email" type="email" placeholder="name@university.edu" autoComplete="email" {...form.register("email")} />
      </FormFieldWrapper>

      <Button type="submit" className="w-full" disabled={mutation.isPending || form.formState.isSubmitting}>
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Send reset link
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Back to login
        </Link>
      </div>
    </Form>
  );
}
