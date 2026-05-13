import * as React from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCardWrapper } from "@/features/auth/components/AuthCardWrapper";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = React.useState("");

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register to submit and track complaints, receive updates, and manage your university support requests in one place."
    >
      <AuthCardWrapper>
        <RegisterForm onRegistered={(email) => setRegisteredEmail(email)} />
      </AuthCardWrapper>
      <div className="text-center text-sm text-muted-foreground">
        {registeredEmail ? <span className="sr-only">Registered email: {registeredEmail}</span> : null}
        Already have an account? <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
