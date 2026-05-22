"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import authStyles from "@/styles/modules/auth.module.css";
import btnStyles from "@/styles/modules/buttons.module.css";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/write";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className={authStyles.wrap}>
      <h1 className={authStyles.title}>관리자 로그인</h1>
      <p className={authStyles.desc}>
        글 작성과 카테고리 관리는 로그인 후 이용할 수 있습니다.
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
            autoComplete="current-password"
          />
        </div>
        {error && <p className={authStyles.error}>{error}</p>}
        <button
          type="submit"
          className={`${btnStyles.btn} ${btnStyles.btnPrimary}`}
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className={authStyles.footer}>
        계정이 없나요?{" "}
        <Link href="/auth/signup" className={authStyles.footerLink}>
          회원가입
        </Link>
      </p>
    </div>
  );
}
