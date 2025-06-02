import { readFileSync } from "fs";
import { join } from "path";

// READMEコンテンツのキャッシュ
let cachedReadmeContent: string | null = null;

export function getReadmeContent(): string {
  // 既にキャッシュされている場合はそれを返す
  if (cachedReadmeContent !== null) {
    return cachedReadmeContent;
  }

  try {
    const readmePath = join(process.cwd(), "README.md");
    const content = readFileSync(readmePath, "utf8");

    // キャッシュに保存
    cachedReadmeContent = content;
    return content;
  } catch (error) {
    console.error("Error reading README.md:", error);
    const fallbackContent =
      "# Role Management Automation\n\nREADMEファイルを読み込めませんでした。";

    // フォールバック内容もキャッシュ
    cachedReadmeContent = fallbackContent;
    return fallbackContent;
  }
}

// 開発環境でキャッシュをクリアする関数（オプション）
export function clearReadmeCache(): void {
  cachedReadmeContent = null;
}
