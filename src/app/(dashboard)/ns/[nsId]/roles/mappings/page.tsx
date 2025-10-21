"use client";
import { useState } from "react";
import { BreadcrumbUpdater } from "@/app/(dashboard)/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNamespace } from "@/hooks/use-namespace";
import type { TNamespaceId } from "@/types/prisma";
import { useOnServiceGroupMappingChange } from "../_hooks/on-mappings-change";
import { AddMapping } from "./_components/AddMapping";
import { Compare } from "./_components/compare/Compare";
import { MappingList } from "./_components/MappingList";

const paths = [
  { label: "ロール管理", path: "/ns/[nsId]/roles" },
  { label: "割り当て", path: "/ns/[nsId]/roles/mappings" },
];

export default function GroupTagsPage({
  params,
}: {
  params: { nsId: TNamespaceId };
}) {
  const { namespace, isPending } = useNamespace({ namespaceId: params.nsId });
  const [isModalOpen, setIsModalOpen] = useState(false);
  useOnServiceGroupMappingChange(() => setIsModalOpen(false));

  if (isPending || !namespace) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-y-hidden h-full flex flex-col space-y-4">
      <div className="flex flex-row justify-end space-x-4">
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              // 閉じる前にバリデーション（AddMappingコンポーネント内の状態を直接チェックできないため、
              // ここでは基本的なチェックのみ）
              // 実際のバリデーションはAddMappingコンポーネント内で行われる
            }
            setIsModalOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>割り当てを追加</Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[90dvh] flex flex-col flex-nowrap">
            <DialogHeader>
              <DialogTitle>割り当てを追加</DialogTitle>
            </DialogHeader>
            <div className="flex-grow-0 overflow-y-scroll">
              <AddMapping nsId={namespace.id} />
            </div>
          </DialogContent>
        </Dialog>
        <Compare nsId={namespace.id} />
      </div>
      <MappingList namespaceId={namespace.id} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
