"use client";
import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { useNamespace } from "@/hooks/use-namespace";
import { MappingList } from "./MappingList";

const paths = [
  { label: "ロール管理", path: "/ns/[nsId]/roles" },
  { label: "割り当て", path: "/ns/[nsId]/roles/mappings" },
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
      <MappingList namespaceId={namespace.id} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
