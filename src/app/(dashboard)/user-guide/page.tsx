import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { getUserGuideContent } from "@/lib/readme";
import type { Metadata } from "next";
import Link from "next/link";

// 静的生成を有効にし、ユーザーガイドが変更された場合に再生成
export const revalidate = false; // 静的生成（ISG無効）
export const dynamic = "force-static"; // 強制的に静的生成

// ビルド時にユーザーガイドコンテンツを事前取得
async function getStaticUserGuideContent(): Promise<string> {
  return getUserGuideContent();
}

// 静的メタデータを生成
export async function generateMetadata(): Promise<Metadata> {
  const userGuideContent = await getStaticUserGuideContent();

  // ユーザーガイドの最初の段落を説明として使用
  const description =
    userGuideContent
      .split("\n")
      .find((line) => line.trim() && !line.startsWith("#"))
      ?.trim() ||
    "Role Management Automationの使用方法を順を追って説明します。";

  return {
    title: "ユーザーガイド - Role Management Automation",
    description,
    keywords: [
      "ユーザーガイド",
      "使用方法",
      "Discord",
      "VRChat",
      "GitHub",
      "Role Management",
      "Automation",
    ],
  };
}

export default async function UserGuidePage() {
  // ビルド時に事前生成されたコンテンツを使用
  const userGuideContent = await getStaticUserGuideContent();

  return (
    <div>
      <MarkdownRenderer content={userGuideContent} />
    </div>
  );
}
