import { Link } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCardWrapper } from "@/features/auth/components/AuthCardWrapper";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Sign in to continue managing your complaints, updates, and account activity with a secure dashboard experience."
    >
      <AuthCardWrapper>
        <LoginForm />
      </AuthCardWrapper>
      <div className="text-center text-sm text-muted-foreground">
        New here? <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">Create an account</Link>
      </div>
    </AuthLayout>
  );
}
