import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { getReadmeContent } from "@/lib/readme";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaGithub } from "react-icons/fa";

// 静的生成を有効にし、READMEが変更された場合に再生成
export const revalidate = false; // 静的生成（ISG無効）
export const dynamic = "force-static"; // 強制的に静的生成

// ビルド時にREADMEコンテンツを事前取得
async function getStaticReadmeContent(): Promise<string> {
  return getReadmeContent();
}

// 静的メタデータを生成
export async function generateMetadata(): Promise<Metadata> {
  const readmeContent = await getStaticReadmeContent();

  // READMEの最初の段落を説明として使用
  const description =
    readmeContent
      .split("\n")
      .find((line) => line.trim() && !line.startsWith("#"))
      ?.trim() ||
    "Role Management Automation - マルチプラットフォーム対応のロール管理システム";

  return {
    title: "Role Management Automation",
    description,
    keywords: [
      "Discord",
      "VRChat",
      "GitHub",
      "Role Management",
      "Automation",
      "Next.js",
    ],
  };
}

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect("/ns");
  }

  // ビルド時に事前生成されたコンテンツを使用
  const readmeContent = await getStaticReadmeContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      {/* ヘッダーアクション */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <Link href="/api/auth/signin">
          <Button className="px-8 py-3 w-full sm:w-auto">Get Started</Button>
        </Link>
        <Link
          href="https://github.com/o-tr/role-management-automation"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="px-8 py-3 w-full sm:w-auto">
            <FaGithub className="mr-2 h-5 w-5" />
            GitHub
          </Button>
        </Link>
      </div>
      <MarkdownRenderer content={readmeContent} />

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
  );
}
