import { Suspense } from "react";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <Suspense fallback={<p>로딩...</p>}>
      <SignUpForm />
    </Suspense>
  );
}
