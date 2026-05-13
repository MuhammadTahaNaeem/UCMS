import { useNavigate, useParams } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCardWrapper } from "@/features/auth/components/AuthCardWrapper";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/login", { replace: true });
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Create a new secure password to regain access to your account."
    >
      <AuthCardWrapper>
        <ResetPasswordForm token={token} onSuccess={handleSuccess} />
      </AuthCardWrapper>
    </AuthLayout>
  );
}
