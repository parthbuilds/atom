import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
      <LoginForm initialMode="signup" />
    </Suspense>
  );
}
