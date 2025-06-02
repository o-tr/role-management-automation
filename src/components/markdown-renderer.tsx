"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダーアクション */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link href="/api/auth/signin">
            <Button size="lg" className="px-8 py-3 w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/user-guide">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 w-full sm:w-auto"
            >
              📖 ユーザーガイド
            </Button>
          </Link>
          <Link
            href="https://github.com/o-tr/role-management-automation"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 w-full sm:w-auto"
            >
              <FaGithub className="mr-2 h-5 w-5" />
              GitHub
            </Button>
          </Link>
        </div>

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

        {/* フッター */}
        <div className="text-center pt-8 mt-12 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="https://github.com/o-tr/role-management-automation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mt-2"
          >
            <FaGithub className="h-4 w-4" />
            View on GitHub
          </Link>
        </div>
      </div>
    </div>
  );
}
