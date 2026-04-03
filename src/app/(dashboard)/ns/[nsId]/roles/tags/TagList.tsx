"use client";

import type { ColumnDef, Table } from "@tanstack/react-table";
import { redirect } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/(dashboard)/ns/[nsId]/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createTag } from "@/requests/createTag";
import { deleteTag } from "@/requests/deleteTag";
import type { TNamespaceId, TTag, TTagId } from "@/types/prisma";
import { TagDisplay } from "../../components/TagDisplay";
import { useTags } from "../_hooks/use-tags";
import { EditTag } from "./EditTag";

type InternalTag = TTag & { namespaceId: TNamespaceId };

const Footer = ({
  table,
  disabled,
  pendingTagIds,
  onDeleteSelected,
}: {
  table: Table<InternalTag>;
  disabled: boolean;
  pendingTagIds: Set<TTagId>;
  onDeleteSelected: (tagIds: TTagId[]) => Promise<void>;
}) => {
  const selected = table.getSelectedRowModel();
  if (selected.rows.length === 0) {
    return <div className="h-[40px]">&nbsp;</div>;
  }
  const selectedIds = selected.rows.map((v) => v.original.id);
  const hasPendingSelected = selectedIds.some((id) => pendingTagIds.has(id));
  const isDisabled = disabled || hasPendingSelected;

  return (
    <div>
      <Button
        variant="outline"
        disabled={isDisabled}
        onClick={() => {
          if (isDisabled) return;
          void onDeleteSelected(selectedIds);
        }}
      >
        選択した {selected.rows.length} 件を削除
      </Button>
    </div>
  );
};

type TagListProps = {
  namespaceId: TNamespaceId;
};

export function TagList({ namespaceId }: TagListProps) {
  const { tags, mutateTags, isPending, responseError } = useTags(namespaceId);
  const [newTagName, setNewTagName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingTagIds, setPendingTagIds] = useState<Set<TTagId>>(
    () => new Set(),
  );
  const [isCreatePending, setIsCreatePending] = useState(false);
  const [isBulkPending, setIsBulkPending] = useState(false);
  const { toast } = useToast();

  const setPendingTags = useCallback((tagIds: TTagId[], pending: boolean) => {
    setPendingTagIds((prev) => {
      const next = new Set(prev);
      for (const tagId of tagIds) {
        if (pending) {
          next.add(tagId);
        } else {
          next.delete(tagId);
        }
      }
      return next;
    });
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || isCreatePending) {
      return;
    }

    setIsCreatePending(true);
    try {
      const createdTag = await createTag(namespaceId, newTagName);
      await mutateTags((current) => {
        if (!current || current.status !== "success") return current;
        return {
          ...current,
          tags: [...current.tags, createdTag],
        };
      }, false);
      setNewTagName("");
      setIsCreateModalOpen(false);
    } catch (error) {
      toast({
        title: "タグ追加に失敗しました",
        description:
          error instanceof Error
            ? error.message
            : "しばらくしてから再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsCreatePending(false);
    }
  };

  const deleteSingleTag = useCallback(
    async (tagId: TTagId) => {
      setPendingTags([tagId], true);
      try {
        await deleteTag(namespaceId, tagId);
        await mutateTags((current) => {
          if (!current || current.status !== "success") return current;
          return {
            ...current,
            tags: current.tags.filter((tag) => tag.id !== tagId),
          };
        }, false);
      } catch (error) {
        toast({
          title: "タグ削除に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
      } finally {
        setPendingTags([tagId], false);
      }
    },
    [mutateTags, namespaceId, setPendingTags, toast],
  );

  const deleteBulkTags = useCallback(
    async (tagIds: TTagId[]) => {
      if (tagIds.length === 0) return;
      if (tagIds.some((tagId) => pendingTagIds.has(tagId))) return;
      setIsBulkPending(true);
      setPendingTags(tagIds, true);
      try {
        const results = await Promise.all(
          tagIds.map(async (tagId) => {
            try {
              await deleteTag(namespaceId, tagId);
              return { status: "success" as const, tagId };
            } catch (error) {
              return {
                status: "error" as const,
                tagId,
                error:
                  error instanceof Error
                    ? error.message
                    : "タグ削除に失敗しました",
              };
            }
          }),
        );
        const deletedTagIds = results
          .filter((result) => result.status === "success")
          .map((result) => result.tagId);
        const failed = results.find((result) => result.status === "error");

        if (deletedTagIds.length > 0) {
          const deletedSet = new Set(deletedTagIds);
          await mutateTags((current) => {
            if (!current || current.status !== "success") return current;
            return {
              ...current,
              tags: current.tags.filter((tag) => !deletedSet.has(tag.id)),
            };
          }, false);
        }

        if (failed?.status === "error") {
          throw new Error(failed.error);
        }
      } catch (error) {
        toast({
          title: "タグ削除に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
      } finally {
        setPendingTags(tagIds, false);
        setIsBulkPending(false);
      }
    },
    [mutateTags, namespaceId, pendingTagIds, setPendingTags, toast],
  );

  const handleTagUpdated = useCallback(
    async (updatedTag: TTag) => {
      await mutateTags((current) => {
        if (!current || current.status !== "success") return current;
        return {
          ...current,
          tags: current.tags.map((tag) =>
            tag.id === updatedTag.id ? updatedTag : tag,
          ),
        };
      }, false);
    },
    [mutateTags],
  );

  const columns = useMemo<ColumnDef<InternalTag>[]>(
    () => [
      {
        id: "select",
        header: CommonCheckboxHeader,
        cell: CommonCheckboxCell,
        size: 50,
        maxSize: 50,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <TagDisplay tag={row.original} variant="ghost" />,
        size: -1,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const disabled = isBulkPending || pendingTagIds.has(row.original.id);
          return (
            <div className="flex space-x-2">
              <EditTag
                nsId={row.original.namespaceId}
                tag={row.original}
                key={row.original.id}
                disabled={disabled}
                onSubmittingChange={(pending) => {
                  setPendingTags([row.original.id], pending);
                }}
                onUpdated={handleTagUpdated}
              />
              <Button
                variant="outline"
                disabled={disabled}
                onClick={() => {
                  void deleteSingleTag(row.original.id);
                }}
              >
                削除
              </Button>
            </div>
          );
        },
        size: 150,
      },
    ],
    [
      deleteSingleTag,
      handleTagUpdated,
      isBulkPending,
      pendingTagIds,
      setPendingTags,
    ],
  );

  if (isPending) {
    return <div>loading...</div>;
  }

  if (responseError) {
    if (responseError.code === 401) {
      redirect("/");
    }
    if (responseError.code === 403 || responseError.code === 404) {
      redirect("/ns/");
    }
    return <div>{responseError.error}</div>;
  }

  return (
    <div className="overflow-y-hidden flex flex-col gap-2">
      <div className="flex flex-row justify-end">
        <Dialog
          open={isCreateModalOpen}
          onOpenChange={(open) => {
            if (isCreatePending) return;
            setIsCreateModalOpen(open);
            if (!open) {
              setNewTagName("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={isCreatePending || isBulkPending}>
              タグを追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddTag} className="flex flex-col gap-2">
              <DialogHeader>タグを追加</DialogHeader>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="新しいタグ名"
                required
                disabled={isCreatePending || isBulkPending}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    isCreatePending ||
                    isBulkPending ||
                    newTagName.trim().length === 0
                  }
                >
                  追加
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={tags?.map((v) => ({ ...v, namespaceId })) || []}
        footer={({ table }) => (
          <Footer
            table={table}
            disabled={isCreatePending || isBulkPending}
            pendingTagIds={pendingTagIds}
            onDeleteSelected={deleteBulkTags}
          />
        )}
      />
    </div>
  );
}
