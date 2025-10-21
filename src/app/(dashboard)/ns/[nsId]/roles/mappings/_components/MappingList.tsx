"use client";

import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
  type TColumnDef,
} from "@/app/(dashboard)/ns/[nsId]/components/DataTable";
import { useMappings } from "@/app/(dashboard)/ns/[nsId]/roles/_hooks/use-mappings";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { deleteMapping } from "@/requests/deleteMapping";
import type { TMapping } from "@/types/prisma";
import {
  onServiceGroupMappingChange,
  useOnServiceGroupMappingChange,
} from "../../_hooks/on-mappings-change";
import { ActionsDisplay } from "./ActionsDisplay";
import { ConditionsDisplay } from "./ConditionsDisplay";
import { EditMapping } from "./EditMapping";

type InternalMapping = TMapping & { namespaceId: string };

export const columns: TColumnDef<InternalMapping>[] = [
  {
    id: "select",
    header: CommonCheckboxHeader,
    cell: CommonCheckboxCell,
    size: 50,
    maxSize: 50,
  },
  {
    id: "enabled",
    header: "有効",
    cell: ({ row }) => {
      const [isToggling, setIsToggling] = useState(false);

      const handleToggle = async (_enabled: boolean) => {
        setIsToggling(true);
        try {
          const response = await fetch(
            `/api/ns/${row.original.namespaceId}/mappings/${row.original.id}/toggle`,
            {
              method: "POST",
            },
          );
          if (response.ok) {
            onServiceGroupMappingChange();
          }
        } catch (error) {
          console.error("Failed to toggle mapping:", error);
        } finally {
          setIsToggling(false);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.enabled}
            onCheckedChange={handleToggle}
            disabled={isToggling}
            aria-busy={isToggling}
          />
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      );
    },
    size: 80,
  },
  {
    id: "condition",
    header: "条件",
    cell: ({ row }) => (
      <div
        className={`flex flex-col ${!row.original.enabled ? "opacity-50" : ""}`}
      >
        <ConditionsDisplay
          conditions={row.original.conditions}
          nsId={row.original.namespaceId}
        />
      </div>
    ),
    widthPercent: 25,
  },
  {
    id: "actions",
    header: "アクション",
    cell: ({ row }) => (
      <div
        className={`flex flex-col ${!row.original.enabled ? "opacity-50" : ""}`}
      >
        <ActionsDisplay
          actions={row.original.actions}
          nsId={row.original.namespaceId}
        />
      </div>
    ),
    widthPercent: 55,
  },
  {
    id: "buttons",
    cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isClosing, setIsClosing] = useState(false);
      const [isDirty, setIsDirty] = useState(false);
      useOnServiceGroupMappingChange(() => setIsModalOpen(false));

      return (
        <div className="flex flex-row gap-2">
          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              if (!open && isDirty) {
                setIsClosing(true);
              } else {
                setIsModalOpen(open);
                setIsDirty(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">編集</Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-full overflow-y-scroll">
              <DialogHeader>
                <DialogTitle>割り当てを編集</DialogTitle>
                <DialogDescription>
                  <EditMapping
                    nsId={row.original.namespaceId}
                    mapping={row.original}
                    onDirtyChange={setIsDirty}
                  />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <AlertDialog open={isClosing} onOpenChange={setIsClosing}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  変更が保存されていませんが、閉じてもよろしいですか？
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsClosing(false);
                    setIsModalOpen(false);
                    setIsDirty(false);
                  }}
                >
                  破棄して閉じる
                </Button>
                <Button variant="outline" onClick={() => setIsClosing(false)}>
                  キャンセル
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            onClick={async () => {
              await deleteMapping(row.original.namespaceId, row.original.id);
              onServiceGroupMappingChange();
            }}
          >
            削除
          </Button>
        </div>
      );
    },
    size: 150,
  },
];

const deleteMappings = async (groupId: string, mappingIds: string[]) => {
  await Promise.all(
    mappingIds.map((mappingId) => deleteMapping(groupId, mappingId)),
  );
  onServiceGroupMappingChange();
};

type TagListProps = {
  namespaceId: string;
};

export function MappingList({ namespaceId }: TagListProps) {
  const { mappings, isPending, responseError } = useMappings(namespaceId);

  if (isPending) return <div>Loading...</div>;

  if (responseError) {
    if (responseError.code === 401) {
      redirect("/");
    }
    if (responseError.code === 403 || responseError.code === 404) {
      redirect("/ns/");
    }
    return <div>Error: {responseError.error}</div>;
  }

  if (!mappings) {
    return <div>割り当てがありません</div>;
  }

  return (
    <div className="overflow-y-hidden">
      <DataTable
        columns={columns}
        data={mappings.map((v) => ({ ...v, namespaceId }))}
        footer={({ table }) => {
          const selected = table.getSelectedRowModel();
          if (selected.rows.length === 0) {
            return <div className="h-[40px]">&nbsp;</div>;
          }

          return (
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  deleteMappings(
                    namespaceId,
                    selected.rows.map((v) => v.original.id),
                  );
                }}
              >
                選択した {selected.rows.length} 件を削除
              </Button>
            </div>
          );
        }}
      />
    </div>
  );
}
