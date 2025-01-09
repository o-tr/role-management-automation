import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { AddAuthentication } from "./_components/AddAuthentication";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  {
    label: "外部サービス",
    path: "/ns/[nsId]/settings/services",
  },
  {
    label: "認証情報",
    path: "/ns/[nsId]/settings/services/authentication",
  },
];

export default function AuthenticationPage({
  params,
}: {
  params: { nsId: string };
}) {
  return (
    <div>
      <BreadcrumbUpdater paths={paths} />
      <AddAuthentication nsId={params.nsId} />
    </div>
  );
}
