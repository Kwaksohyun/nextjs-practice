import Link from "next/link";
import homeStyles from "@/styles/modules/blog-home.module.css";

export default function NotFound() {
  return (
    <div className={homeStyles.empty}>
      <p>페이지를 찾을 수 없습니다.</p>
      <Link href="/">홈으로 돌아가기</Link>
    </div>
  );
}
