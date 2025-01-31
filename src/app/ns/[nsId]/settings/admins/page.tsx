"use client";
import type { TNamespaceId } from "@/types/prisma";
import { BreadcrumbUpdater } from "../../components/Breadcrumb/BreadcrumbUpdater";

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
  return (
    <div>
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
