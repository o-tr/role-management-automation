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
import { useState } from "react";
import { useOnServiceGroupMappingChange } from "../_hooks/on-mappings-change";
import { useGroupMembers } from "../_hooks/use-group-members";
import { AddMapping } from "./_components/AddMapping";
import { MappingList } from "./_components/MappingList";

const paths = [
  { label: "ロール管理", path: "/ns/[nsId]/roles" },
  { label: "割り当て", path: "/ns/[nsId]/roles/mappings" },
];

export default function GroupTagsPage({
  params,
}: {
  params: { nsId: string };
}) {
  const { namespace, isPending } = useNamespace({ namespaceId: params.nsId });
  const [isModalOpen, setIsModalOpen] = useState(false);
  useOnServiceGroupMappingChange(() => setIsModalOpen(false));

  if (isPending || !namespace) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="flex flex-row justify-end">
          <DialogTrigger asChild>
            <Button>割り当てを追加</Button>
          </DialogTrigger>
        </div>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>割り当てを追加</DialogTitle>
            <DialogDescription>
              <AddMapping nsId={namespace.id} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <MappingList namespaceId={namespace.id} />
      <BreadcrumbUpdater paths={paths} />
    </div>
  );
}
