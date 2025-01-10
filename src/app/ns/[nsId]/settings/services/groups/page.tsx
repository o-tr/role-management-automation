import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { AddGroup } from "./_components/AddGroup";

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
    <div>
      <BreadcrumbUpdater paths={paths} />
      <AddGroup nsId={params.nsId} />
    </div>
  );
}
