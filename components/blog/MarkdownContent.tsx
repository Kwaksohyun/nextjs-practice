import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import detailStyles from "@/styles/modules/post-detail.module.css";

type Props = {
  content: string;
};

export default function MarkdownContent({ content }: Props) {
  return (
    <div className={detailStyles.content}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
