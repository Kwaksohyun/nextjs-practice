"use client";

import { useState } from "react";
import btnStyles from "@/styles/modules/buttons.module.css";

type Props = {
  url: string;
};

export default function CopyUrlButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("URL 복사에 실패했습니다.");
    }
  }

  return (
    <button
      type="button"
      className={`${btnStyles.btn} ${copied ? btnStyles.btnCopied : ""}`}
      onClick={handleCopy}
    >
      {copied ? "복사됨!" : "URL 복사"}
    </button>
  );
}
