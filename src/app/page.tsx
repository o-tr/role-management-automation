import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Redirector } from "@/components/redirector";
import { useNamespaces } from "@/hooks/use-namespaces";
import { getReadmeContent } from "@/lib/readme";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
  // ビルド時に事前生成されたコンテンツを使用
  const readmeContent = await getStaticReadmeContent();

  return (
    <>
      <Redirector />
      <MarkdownRenderer content={readmeContent} />
    </>
  );
}
