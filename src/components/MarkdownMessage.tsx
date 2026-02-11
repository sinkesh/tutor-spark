import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-2">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 text-sm mb-2">{children}</ul>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
