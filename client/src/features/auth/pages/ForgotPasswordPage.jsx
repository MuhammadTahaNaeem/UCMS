import { Link } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCardWrapper } from "@/features/auth/components/AuthCardWrapper";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email address and we will send a secure password reset link if an account exists."
    >
      <AuthCardWrapper>
        <ForgotPasswordForm />
      </AuthCardWrapper>
      <div className="text-center text-sm text-muted-foreground">
        Remember your password? <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
