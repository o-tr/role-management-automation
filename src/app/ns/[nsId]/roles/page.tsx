import { redirect } from "next/navigation";

export default function GroupTagsPage({
  params,
}: {
  params: { nsId: string };
}) {
  redirect(`/ns/${params.nsId}/roles/mappings`);
}
