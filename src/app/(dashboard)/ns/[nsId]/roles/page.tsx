import { redirect } from "next/navigation";

export default async function GroupTagsPage({
  params,
}: {
  params: Promise<{ nsId: string }>;
}) {
  const { nsId } = await params;
  redirect(`/ns/${nsId}/roles/mappings`);
}
