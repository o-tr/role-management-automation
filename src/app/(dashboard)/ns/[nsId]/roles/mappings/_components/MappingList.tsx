"use client";

import type { Row } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { type FC, useCallback, useMemo, useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { convertTSerializedMappingToTMapping } from "@/lib/prisma/convert/convertTSerializedMappingToTMapping";
import { deleteMapping } from "@/requests/deleteMapping";
import type { TMapping, TMappingId, TSerializedMapping } from "@/types/prisma";
import { ActionsDisplay } from "./ActionsDisplay";
import { ConditionsDisplay } from "./ConditionsDisplay";
import { EditMapping } from "./EditMapping";

type InternalMapping = TMapping & { namespaceId: string };

const MappingEnabledCell: FC<{
  row: InternalMapping;
  disabled: boolean;
  onToggle: (mapping: InternalMapping) => Promise<void>;
}> = ({ row, disabled, onToggle }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (disabled || isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(row);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={row.enabled}
        onCheckedChange={() => {
          void handleToggle();
        }}
        disabled={disabled || isToggling}
        aria-busy={isToggling}
      />
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : null}
    </div>
  );
};

const MappingActionsCell: FC<{
  row: InternalMapping;
  disabled: boolean;
  onDelete: (mappingId: TMappingId) => Promise<void>;
}> = ({ row, disabled, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  return (
    <div className="flex flex-row gap-2">
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (disabled) return;
          if (!open && isDirty) {
            setIsClosing(true);
          } else {
            setIsModalOpen(open);
            setIsDirty(false);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" disabled={disabled}>
            編集
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl max-h-full overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>割り当てを編集</DialogTitle>
            <DialogDescription>
              <EditMapping
                nsId={row.namespaceId}
                mapping={row}
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
        disabled={disabled}
        onClick={() => {
          void onDelete(row.id);
        }}
      >
        削除
      </Button>
    </div>
  );
};

type TagListProps = {
  namespaceId: string;
};

export function MappingList({ namespaceId }: TagListProps) {
  const { mappings, isPending, responseError, mutateMappings } =
    useMappings(namespaceId);
  const { toast } = useToast();
  const [pendingMappingIds, setPendingMappingIds] = useState<Set<TMappingId>>(
    () => new Set(),
  );
  const [isBulkPending, setIsBulkPending] = useState(false);

  const setPendingMappings = useCallback(
    (mappingIds: TMappingId[], pending: boolean) => {
      setPendingMappingIds((prev) => {
        const next = new Set(prev);
        for (const mappingId of mappingIds) {
          if (pending) {
            next.add(mappingId);
          } else {
            next.delete(mappingId);
          }
        }
        return next;
      });
    },
    [],
  );

  const updateMapping = useCallback(
    async (serialized: TSerializedMapping) => {
      const updatedMapping = convertTSerializedMappingToTMapping(serialized);
      await mutateMappings((current) => {
        if (!current || current.status !== "success") return current;
        return {
          ...current,
          mappings: current.mappings.map((mapping) =>
            mapping.id === serialized.id ? serialized : mapping,
          ),
        };
      }, false);
      return updatedMapping;
    },
    [mutateMappings],
  );

  const toggleMappingEnabled = useCallback(
    async (mapping: InternalMapping) => {
      setPendingMappings([mapping.id], true);
      try {
        const response = await fetch(
          `/api/ns/${mapping.namespaceId}/mappings/${mapping.id}/toggle`,
          {
            method: "POST",
          },
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "割り当ての有効状態更新に失敗しました");
        }
        const payload = (await response.json()) as
          | { status: "success"; mapping: TSerializedMapping }
          | { status: "error"; error: string };
        if (payload.status === "error") {
          throw new Error(payload.error);
        }
        await updateMapping(payload.mapping);
      } catch (error) {
        toast({
          title: "割り当ての有効状態更新に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
      } finally {
        setPendingMappings([mapping.id], false);
      }
    },
    [setPendingMappings, toast, updateMapping],
  );

  const deleteSingleMapping = useCallback(
    async (mappingId: TMappingId) => {
      setPendingMappings([mappingId], true);
      try {
        const response = await deleteMapping(namespaceId, mappingId);
        if (response.status === "error") {
          throw new Error(response.error);
        }
        await mutateMappings((current) => {
          if (!current || current.status !== "success") return current;
          return {
            ...current,
            mappings: current.mappings.filter(
              (mapping) => mapping.id !== mappingId,
            ),
          };
        }, false);
      } catch (error) {
        toast({
          title: "割り当て削除に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
      } finally {
        setPendingMappings([mappingId], false);
      }
    },
    [mutateMappings, namespaceId, setPendingMappings, toast],
  );

  const deleteBulkMappings = useCallback(
    async (mappingIds: TMappingId[]) => {
      if (mappingIds.length === 0) return;
      if (mappingIds.some((mappingId) => pendingMappingIds.has(mappingId))) {
        return;
      }
      setIsBulkPending(true);
      setPendingMappings(mappingIds, true);
      try {
        const results = await Promise.all(
          mappingIds.map(async (mappingId) => {
            try {
              const response = await deleteMapping(namespaceId, mappingId);
              return { mappingId, response };
            } catch (error) {
              return {
                mappingId,
                response: {
                  status: "error" as const,
                  code: 500,
                  error: error instanceof Error ? error.message : String(error),
                },
              };
            }
          }),
        );
        const deletedIds = results
          .filter((result) => result.response.status === "success")
          .map((result) => result.mappingId);
        const failedMessages = results
          .filter((result) => result.response.status === "error")
          .map((result) =>
            result.response.status === "error" ? result.response.error : "",
          )
          .filter((message) => message.length > 0);

        if (deletedIds.length > 0) {
          const deletedSet = new Set(deletedIds);
          await mutateMappings((current) => {
            if (!current || current.status !== "success") return current;
            return {
              ...current,
              mappings: current.mappings.filter(
                (mapping) => !deletedSet.has(mapping.id),
              ),
            };
          }, false);
        }

        if (failedMessages.length > 0) {
          throw new Error([...new Set(failedMessages)].join("\n"));
        }
      } catch (error) {
        toast({
          title: "割り当て削除に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
      } finally {
        setPendingMappings(mappingIds, false);
        setIsBulkPending(false);
      }
    },
    [mutateMappings, namespaceId, pendingMappingIds, setPendingMappings, toast],
  );

  const columns = useMemo<TColumnDef<InternalMapping>[]>(
    () => [
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
        cell: ({ row }) => (
          <MappingEnabledCell
            row={row.original}
            disabled={isBulkPending || pendingMappingIds.has(row.original.id)}
            onToggle={toggleMappingEnabled}
          />
        ),
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
        cell: ({ row }) => (
          <MappingActionsCell
            row={row.original}
            disabled={isBulkPending || pendingMappingIds.has(row.original.id)}
            onDelete={deleteSingleMapping}
          />
        ),
        size: 150,
      },
    ],
    [
      deleteSingleMapping,
      isBulkPending,
      pendingMappingIds,
      toggleMappingEnabled,
    ],
  );

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
        calcRowClassName={(row: Row<InternalMapping>) =>
          pendingMappingIds.has(row.original.id) ? "opacity-70" : ""
        }
        footer={({ table }) => {
          const selected = table.getSelectedRowModel();
          if (selected.rows.length === 0) {
            return <div className="h-[40px]">&nbsp;</div>;
          }
          const selectedIds = selected.rows.map((v) => v.original.id);
          const hasPendingSelected = selectedIds.some((id) =>
            pendingMappingIds.has(id),
          );
          const isDeleteDisabled = isBulkPending || hasPendingSelected;
          const deletableIds = selectedIds.filter(
            (id) => !pendingMappingIds.has(id),
          );

          return (
            <div>
              <Button
                variant="outline"
                disabled={isDeleteDisabled}
                onClick={() => {
                  if (deletableIds.length === 0 || isDeleteDisabled) return;
                  void deleteBulkMappings(deletableIds);
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
