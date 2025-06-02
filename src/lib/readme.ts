import { readFileSync } from "fs";
import { join } from "path";

export function getReadmeContent(): string {
  try {
    const readmePath = join(process.cwd(), "README.md");
    const content = readFileSync(readmePath, "utf8");
    return content;
  } catch (error) {
    console.error("Error reading README.md:", error);
    return "# Role Management Automation\n\nREADMEファイルを読み込めませんでした。";
  }
}
