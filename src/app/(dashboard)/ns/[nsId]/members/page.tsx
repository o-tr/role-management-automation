"use client";
import { BreadcrumbUpdater } from "@/app/(dashboard)/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNamespace } from "@/hooks/use-namespace";
import type { TNamespaceId } from "@/types/prisma";
import { AddMembers } from "./_components/AddMembers";
import { AddPastedMembers } from "./_components/AddPastedMembers";
import { MemberList } from "./_components/MemberList";

const paths = [{ label: "メンバー管理", path: "/ns/[nsId]/members" }];

export default function GroupTagsPage({
  params,
}: {
  params: { nsId: TNamespaceId };
}) {
  return (
    <div className="h-full flex flex-col overflow-y-hidden gap-2">
      <div className="flex flex-row justify-end items-center gap-2">
        <AddMembers nsId={params.nsId} />
        <span>またはテーブルを貼り付け</span>
      </div>
      <MemberList
        namespaceId={params.nsId}
        className="flex-grow-0 overflow-y-hidden"
      />
      <AddPastedMembers nsId={params.nsId} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
