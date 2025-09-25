"use client";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Markdownコンテンツ */}
      <div className="prose prose-lg dark:prose-invert mx-auto max-w-4xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 dark:text-gray-300">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{children}</span>
              </li>
            ),
            code: ({ children, ...props }) => {
              return (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                  <pre className="text-sm">
                    <code {...props}>{children}</code>
                  </pre>
                </div>
              );
            },
            strong: ({ children }) => (
              <strong className="font-bold text-gray-800 dark:text-gray-200">
                {children}
              </strong>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
