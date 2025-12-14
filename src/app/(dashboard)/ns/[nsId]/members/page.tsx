"use client";
import { use } from "react";
import { BreadcrumbUpdater } from "@/app/(dashboard)/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import type { TNamespaceId } from "@/types/prisma";
import { AddMembers } from "./_components/AddMembers";
import { AddPastedMembers } from "./_components/AddPastedMembers";
import { MemberList } from "./_components/MemberList";

const paths = [{ label: "メンバー管理", path: "/ns/[nsId]/members" }];

export default function GroupTagsPage({
  params,
}: {
  params: Promise<{ nsId: TNamespaceId }>;
}) {
  const { nsId } = use(params);
  return (
    <div className="h-full flex flex-col overflow-y-hidden gap-2">
      <div className="flex flex-row justify-end items-center gap-2">
        <AddMembers nsId={nsId} />
        <span>またはテーブルを貼り付け</span>
      </div>
      <MemberList
        namespaceId={nsId}
        className="flex-grow-0 overflow-y-hidden"
      />
      <AddPastedMembers nsId={nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
