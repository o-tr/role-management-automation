"use client";
import { BreadcrumbUpdater } from "@/app/ns/[nsId]/components/Breadcrumb/BreadcrumbUpdater";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNamespace } from "@/hooks/use-namespace";
import type { TNamespaceId } from "@/types/prisma";
import { useState } from "react";
import { useOnServiceGroupMappingChange } from "../_hooks/on-mappings-change";
import { AddMapping } from "./_components/AddMapping";
import { MappingList } from "./_components/MappingList";
import { Compare } from "./_components/compare/Compare";

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
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  useOnServiceGroupMappingChange(() => setIsModalOpen(false));

  if (isPending || !namespace) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-row justify-end">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>割り当てを追加</Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl">
            <DialogHeader>
              <DialogTitle>割り当てを追加</DialogTitle>
              <DialogDescription>
                <AddMapping nsId={namespace.id} />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Dialog open={isDiffModalOpen} onOpenChange={setIsDiffModalOpen}>
          <DialogTrigger asChild>
            <Button>差分を表示</Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[90dvh] flex flex-col flex-nowrap">
            <DialogHeader>
              <DialogTitle>割り当ての差分</DialogTitle>
            </DialogHeader>
            <div className="p-4 overflow-y-auto h-full">
              {isDiffModalOpen && <Compare nsId={namespace.id} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <MappingList namespaceId={namespace.id} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
