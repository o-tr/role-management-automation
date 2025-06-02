import { MarkdownRenderer } from "@/components/markdown-renderer";
import { getReadmeContent } from "@/lib/readme";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect("/ns");
  }

  const readmeContent = getReadmeContent();

  return <MarkdownRenderer content={readmeContent} />;
}
