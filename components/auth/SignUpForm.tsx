"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import authStyles from "@/styles/modules/auth.module.css";
import btnStyles from "@/styles/modules/buttons.module.css";

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/write`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/write");
      router.refresh();
      return;
    }

    setMessage(
      "가입이 완료되었습니다. 이메일 인증이 켜져 있다면 메일함을 확인한 뒤 로그인해주세요."
    );
  }

  return (
    <div className={authStyles.wrap}>
      <h1 className={authStyles.title}>회원가입</h1>
      <p className={authStyles.desc}>
        계정을 만들면 글 작성과 카테고리 관리를 할 수 있습니다.
      </p>

      <form className={authStyles.form} onSubmit={handleSubmit}>
        <div className={authStyles.field}>
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className={authStyles.field}>
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <p className={authStyles.hint}>6자 이상</p>
        </div>
        <div className={authStyles.field}>
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        {error && <p className={authStyles.error}>{error}</p>}
        {message && <p className={authStyles.success}>{message}</p>}
        <button
          type="submit"
          className={`${btnStyles.btn} ${btnStyles.btnPrimary}`}
          disabled={loading}
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p className={authStyles.footer}>
        이미 계정이 있나요?{" "}
        <Link href="/auth/login" className={authStyles.footerLink}>
          로그인
        </Link>
      </p>
    </div>
  );
}
