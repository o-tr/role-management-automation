"use client";
import { EditNSName } from "@/app/(dashboard)/ns/[nsId]/settings/_components/EditNSName";
import { useNamespace } from "@/hooks/use-namespace";
import type { TNamespaceId } from "@/types/prisma";
import { redirect } from "next/navigation";
import { BreadcrumbUpdater } from "../components/Breadcrumb/BreadcrumbUpdater";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  { label: "基本設定", path: "/ns/[nsId]/settings" },
];

type Props = {
  params: {
    nsId: TNamespaceId;
  };
};

export default function GroupSettingsPage({ params: { nsId } }: Props) {
  const { namespace, isPending } = useNamespace({ namespaceId: nsId });
  if (isPending) {
    return <p>Loading...</p>;
  }
  if (!namespace) {
    redirect("/ns");
    return <></>;
  }
  return (
    <div>
      <EditNSName nsId={nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
