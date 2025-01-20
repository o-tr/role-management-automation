"use client";
import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { TagList } from "@/app/ns/[nsId]/roles/tags/TagList";
import { useNamespace } from "@/hooks/use-namespace";

const paths = [{ label: "ロール管理", path: "/ns/[nsId]/roles" }];

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
      <TagList namespaceId={namespace.id} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
