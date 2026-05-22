"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import navStyles from "@/styles/modules/nav.module.css";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      className={navStyles.authLink}
      onClick={handleSignOut}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      로그아웃
    </button>
  );
}
