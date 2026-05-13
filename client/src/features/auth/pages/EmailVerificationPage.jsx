import * as React from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { MailCheck, Loader2 } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCardWrapper } from "@/features/auth/components/AuthCardWrapper";
import { Button } from "@/components/ui/button";
import { useResendVerification } from "@/features/auth/hooks/useResendVerification";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export function EmailVerificationPage() {
  const location = useLocation();
  const { toast } = useToast();
  const resendMutation = useResendVerification();
  const verifyMutation = useVerifyEmail();
  const params = useParams();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    const token = params.token;
    if (token) {
      verifyMutation.mutate(token, {
        onSuccess: () => {
          toast({ title: "Email verified", description: "You can now sign in." });
          navigate("/login");
        },
        onError: (err) => {
          toast({ title: "Verification failed", description: err?.response?.data?.message || "Invalid or expired token.", variant: "destructive" });
        },
      });
    }
  }, [navigate, params.token, toast, verifyMutation]);

  const handleResend = () => {
    resendMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          toast({ title: "Verification email sent", description: data?.message || "Please check your inbox." });
        },
        onError: () => {
          toast({ title: "Unable to resend", description: "Please try again shortly.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AuthLayout
      title="Email verification"
      subtitle="Confirm your email address before continuing to the system."
    >
      <AuthCardWrapper className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-7" />
        </div>

        <div className="mt-4 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Please verify your email address.</h2>
          <p className="text-sm text-muted-foreground">
            {email ? `We sent a confirmation link to ${email}.` : "Please open the verification email sent to your inbox."}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Button className="w-full" variant="outline" onClick={handleResend} disabled={resendMutation.isPending || !email}>
            {resendMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Resend Verification Email
          </Button>

          <p className="text-xs text-muted-foreground">
            Already verified? <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </div>
      </AuthCardWrapper>
    </AuthLayout>
  );
}
