"use client";
import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { useNamespace } from "@/hooks/use-namespace";
import { AddMembers } from "./_components/AddMembers";
import { AddPastedMembers } from "./_components/AddPastedMembers";
import { MemberList } from "./_components/MemberList";

const paths = [{ label: "メンバー管理", path: "/ns/[nsId]/members" }];

export default function GroupTagsPage({
  params,
}: {
  params: { nsId: string };
}) {
  const { namespace, isPending } = useNamespace({ namespaceId: params.nsId });

  if (isPending || !namespace) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <MemberList namespaceId={params.nsId} />
      <AddMembers nsId={params.nsId} />
      <AddPastedMembers nsId={params.nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
