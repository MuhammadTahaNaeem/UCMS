import * as React from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { MailCheck, Loader2 } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCardWrapper } from "@/features/auth/components/AuthCardWrapper";
import { Button } from "@/components/ui/button";
import { useResendVerification } from "@/features/auth/hooks/useResendVerification";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";

export function EmailVerificationPage() {
  const location = useLocation();
  const { toast } = useToast();
  const resendMutation = useResendVerification();
  const verifyMutation = useVerifyEmail();
  const params = useParams();
  const navigate = useNavigate();
  const email = location.state?.email;
  const hasVerificationAttempted = useRef(false);
  const redirectTimeoutRef = useRef(null);
  const [verificationStatus, setVerificationStatus] = useState(params.token ? "success" : "verifying");

  const redirectToLogin = () => {
    window.location.replace("/login");
  };

  useEffect(() => {
    const token = params.token;
    if (token && !verifyMutation.isPending && !hasVerificationAttempted.current) {
      hasVerificationAttempted.current = true;
      setVerificationStatus("success");
      toast({ title: "Email verified", description: "Your account is now ready. Redirecting to login." });
      redirectTimeoutRef.current = window.setTimeout(() => {
        redirectToLogin();
      }, 1200);
      verifyMutation.mutate(token, {
      });
    }
  }, [params.token, verifyMutation, toast]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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
          <h2 className="text-2xl font-semibold tracking-tight">
            {verificationStatus === "success"
              ? "Email verified successfully"
              : "Please verify your email address."}
          </h2>
          <p className="text-sm text-muted-foreground">
            {verificationStatus === "success"
              ? "Your email has been verified. You may close this tab."
              : email
                  ? `We sent a confirmation link to ${email}.`
                  : "Please open the verification email sent to your inbox."}
          </p>
        </div>

        {verificationStatus !== "success" ? (
          <div className="mt-6 space-y-3">
            <Button className="w-full" variant="outline" onClick={handleResend} disabled={resendMutation.isPending || !email}>
              {resendMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Resend Verification Email
            </Button>

            <p className="text-xs text-muted-foreground">
              Already verified? <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
            </p>
          </div>
        ) : null}
      </AuthCardWrapper>
    </AuthLayout>
  );
}