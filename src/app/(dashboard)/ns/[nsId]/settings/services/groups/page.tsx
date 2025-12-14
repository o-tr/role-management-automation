import { BreadcrumbUpdater } from "@/app/(dashboard)/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import type { TNamespaceId } from "@/types/prisma";
import { AddGroup } from "./_components/AddGroup";
import { GroupList } from "./_components/GroupList";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  {
    label: "外部サービス",
    path: "/ns/[nsId]/settings/services",
  },
  {
    label: "グループ",
    path: "/ns/[nsId]/settings/services/groups",
  },
];

export default async function GroupProvidersPage({
  params,
}: {
  params: Promise<{ nsId: TNamespaceId }>;
}) {
  const { nsId } = await params;
  return (
    <div className="h-full overflow-y-hidden flex flex-col gap-2">
      <BreadcrumbUpdater paths={paths} />
      <GroupList nsId={nsId} />
      <AddGroup nsId={nsId} />
    </div>
  );
}
