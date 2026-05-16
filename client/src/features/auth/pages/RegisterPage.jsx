import * as React from "react";
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
      {registeredEmail ? <span className="sr-only">Registered email: {registeredEmail}</span> : null}
    </AuthLayout>
  );
}
