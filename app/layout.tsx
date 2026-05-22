import type { Metadata } from "next";
import BlogNav from "@/components/blog/BlogNav";
import layoutStyles from "@/styles/modules/layout.module.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dev Blog",
  description: "개발 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={layoutStyles.root}>
        <BlogNav />
        <main className={layoutStyles.main}>{children}</main>
      </body>
    </html>
  );
}
