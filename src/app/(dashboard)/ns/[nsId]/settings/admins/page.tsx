"use client";
import { use } from "react";
import type { TNamespaceId } from "@/types/prisma";
import { BreadcrumbUpdater } from "../../components/Breadcrumb/BreadcrumbUpdater";
import { AdminsList } from "./_components/AdminsList";

const paths = [
  { label: "ネームスペース設定", path: "/ns/[nsId]/settings" },
  { label: "管理者", path: "/ns/[nsId]/admins" },
];

type Props = {
  params: Promise<{
    nsId: TNamespaceId;
  }>;
};

export default function GroupSettingsPage({ params }: Props) {
  const { nsId } = use(params);
  return (
    <div>
      <AdminsList nsId={nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
