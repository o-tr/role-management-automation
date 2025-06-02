import { BreadcrumbUpdater } from "@/app/(dashboard)/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { TagList } from "@/app/(dashboard)/ns/[nsId]/roles/tags/TagList";
import type { TNamespaceId } from "@/types/prisma";

const paths = [
  { label: "ロール管理", path: "/ns/[nsId]/roles" },
  { label: "タグ管理", path: "/ns/[nsId]/roles/tags" },
];

export default function GroupTagsPage({
  params,
}: {
  params: { nsId: TNamespaceId };
}) {
  return (
    <div className="h-full overflow-y-hidden flex flex-col">
      <TagList namespaceId={params.nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
