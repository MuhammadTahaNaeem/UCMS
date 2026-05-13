import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "@/components/shared/FormFieldWrapper";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { loginSchema } from "@/features/auth/authSchemas";
import { setCredentials } from "@/features/auth/authSlice";
import { useToast } from "@/components/ui/toast";

const routeByRole = {
  Admin: "/admin/dashboard",
  Staff: "/staff/dashboard",
  User: "/user/dashboard",
};

export function LoginForm({ onSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (values) => {
    try {
      const data = await loginMutation.mutateAsync(values);
      const payload = {
        user: data?.user ?? data?.data?.user ?? null,
        token: data?.token ?? data?.data?.token ?? null,
        role: data?.role ?? data?.data?.role ?? data?.user?.role ?? data?.data?.user?.role ?? "User",
        rememberMe: values.rememberMe,
      };

      dispatch(setCredentials(payload));
      onSuccess?.(payload);
      toast({ title: "Login successful", description: data?.message || "Welcome back." });

      const destination = routeByRole[payload.role] ?? "/user/dashboard";
      navigate(destination, { replace: true });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error?.response?.data?.message || "Invalid credentials or unavailable account.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="Email" htmlFor="email" required error={form.formState.errors.email?.message}>
        <Input id="email" type="email" placeholder="name@university.edu" autoComplete="email" {...form.register("email")} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Password" htmlFor="password" required error={form.formState.errors.password?.message}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="pr-10"
            {...form.register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute inset-y-0 right-1 my-auto"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </FormFieldWrapper>

      <Controller
        control={form.control}
        name="rememberMe"
        render={({ field }) => (
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
            Remember me on this device
          </label>
        )}
      />

      <Button type="submit" className="w-full" disabled={loginMutation.isPending || form.formState.isSubmitting}>
        {loginMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Sign in
      </Button>

      <div className="flex items-center justify-between gap-4 text-sm">
        <Link to="/forgot-password" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Forgot password?
        </Link>
        <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create account
        </Link>
      </div>
    </Form>
  );
}
