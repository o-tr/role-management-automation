import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
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
  params: { nsId: string };
}) {
  return (
    <div className="space-y-2">
      <BreadcrumbUpdater paths={paths} />
      <GroupList nsId={params.nsId} />
      <AddGroup nsId={params.nsId} />
    </div>
  );
}
