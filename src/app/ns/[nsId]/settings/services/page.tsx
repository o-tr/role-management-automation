import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import type { TNamespaceId } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  {
    label: "外部サービス",
    path: "/ns/[nsId]/settings/services",
  },
];

export default async function GroupProvidersPage({
  params,
}: {
  params: { nsId: TNamespaceId };
}) {
  redirect(`/ns/${params.nsId}/settings/services/accounts`);
}
