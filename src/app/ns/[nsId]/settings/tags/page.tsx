"use client";
import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import TagList from "@/app/ns/[nsId]/settings/tags/TagList";
import { useNamespace } from "@/hooks/use-namespace";
import type { GroupId } from "@/types/brandTypes";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  { label: "タグ管理", path: "/ns/[nsId]/settings/tags" },
];

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
      <TagList namespaceId={namespace.id as GroupId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
