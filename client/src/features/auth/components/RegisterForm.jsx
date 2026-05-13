import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { registerSchema } from "@/features/auth/authSchemas";
import { PasswordInput } from "./PasswordInput";
import { useToast } from "@/components/ui/toast";

const defaultValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

export function RegisterForm({ onRegistered }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });

  const onSubmit = async (values) => {
    try {
      const data = await registerMutation.mutateAsync(values);
      toast({ title: "Registration successful", description: data?.message || "Your account has been created." });
      onRegistered?.(values.email, data);
      navigate("/email-verification", { state: { email: values.email, message: data?.message } });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error?.response?.data?.message || "Please review the form and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="Full Name" htmlFor="fullName" required error={form.formState.errors.fullName?.message}>
        <Input id="fullName" placeholder="Enter your full name" autoComplete="name" {...form.register("fullName")} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Email" htmlFor="email" required error={form.formState.errors.email?.message}>
        <Input id="email" type="email" placeholder="name@university.edu" autoComplete="email" {...form.register("email")} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Password" htmlFor="password" required error={form.formState.errors.password?.message}>
        <PasswordInput id="password" placeholder="Create a password" autoComplete="new-password" {...form.register("password")} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Confirm Password" htmlFor="confirmPassword" required error={form.formState.errors.confirmPassword?.message}>
        <PasswordInput id="confirmPassword" placeholder="Re-enter your password" autoComplete="new-password" {...form.register("confirmPassword")} />
      </FormFieldWrapper>

      <div className="space-y-2">
        <Controller
          control={form.control}
          name="terms"
          render={({ field }) => (
            <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3 text-sm">
              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
              <span className="leading-6 text-muted-foreground">
                I agree to the <span className="font-medium text-foreground">Terms &amp; Conditions</span> and understand the acceptable use policy.
              </span>
            </label>
          )}
        />
        {form.formState.errors.terms?.message ? <p className="text-xs font-medium text-destructive">{form.formState.errors.terms.message}</p> : null}
      </div>

      <Button type="submit" className="w-full" disabled={registerMutation.isPending || form.formState.isSubmitting}>
        {registerMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </Form>
  );
}
