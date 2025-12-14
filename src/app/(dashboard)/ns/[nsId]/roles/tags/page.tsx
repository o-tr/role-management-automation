import { BreadcrumbUpdater } from "@/app/(dashboard)/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { TagList } from "@/app/(dashboard)/ns/[nsId]/roles/tags/TagList";
import type { TNamespaceId } from "@/types/prisma";

const paths = [
  { label: "ロール管理", path: "/ns/[nsId]/roles" },
  { label: "タグ管理", path: "/ns/[nsId]/roles/tags" },
];

export default async function GroupTagsPage({
  params,
}: {
  params: Promise<{ nsId: TNamespaceId }>;
}) {
  const { nsId } = await params;
  return (
    <div className="h-full overflow-y-hidden flex flex-col">
      <TagList namespaceId={nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
