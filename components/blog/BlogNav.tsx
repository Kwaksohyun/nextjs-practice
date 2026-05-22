import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/auth/SignOutButton";
import navStyles from "@/styles/modules/nav.module.css";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/write", label: "글쓰기" },
  { href: "/admin/categories", label: "카테고리" },
];

type Props = {
  activePath?: string;
};

export default async function BlogNav({ activePath }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className={navStyles.header}>
      <div className={navStyles.inner}>
        <Link href="/" className={navStyles.logo}>
          Dev<span>Blog</span>
        </Link>

        <nav className={navStyles.tabs}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${navStyles.tab} ${
                activePath === item.href ? navStyles.tabActive : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={navStyles.authArea}>
          {user ? (
            <>
              <span>{user.email}</span> · <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/auth/login" className={navStyles.authLink}>
                로그인
              </Link>
              {" · "}
              <Link href="/auth/signup" className={navStyles.authLink}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
