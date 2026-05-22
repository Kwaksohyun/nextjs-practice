import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p>로딩...</p>}>
      <LoginForm />
    </Suspense>
  );
}
