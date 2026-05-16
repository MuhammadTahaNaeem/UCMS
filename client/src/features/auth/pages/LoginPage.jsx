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
    </AuthLayout>
  );
}
