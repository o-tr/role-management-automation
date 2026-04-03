"use client";

import type {
  ColumnDef,
  StringOrTemplateHeader,
  Table,
} from "@tanstack/react-table";
import { redirect } from "next/navigation";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { TbFilter, TbPlus } from "react-icons/tb";
import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/(dashboard)/ns/[nsId]/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { deleteMember } from "@/requests/deleteMember";
import type {
  TMemberId,
  TMemberWithRelation,
  TNamespaceId,
  TTag,
  TTagId,
} from "@/types/prisma";
import { MemberExternalAccountDisplay } from "../../components/MemberExternalAccountDisplay";
import { MultipleTagPicker } from "../../components/MultipleTagPicker";
import { TagDisplay } from "../../components/TagDisplay";
import { useTags } from "../../roles/_hooks/use-tags";
import { useMembers } from "../_hooks/use-members";
import { usePatchMember } from "../_hooks/use-patch-member";
import { EditMember } from "./EditMember/EditMember";

const TagsHeader: StringOrTemplateHeader<TMemberWithRelation, unknown> = ({
  table,
}) => {
  const rows = table.getCoreRowModel().rows;
  const tags = useMemo(() => {
    const seen = new Set<TTagId>();
    const acc: TTag[] = [];
    for (const row of rows) {
      for (const tag of row.original.tags) {
        if (!seen.has(tag.id)) {
          seen.add(tag.id);
          acc.push(tag);
        }
      }
    }
    return acc.sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);
  const [selectedTags, setSelectedTags] = useState<TTagId[]>([]);

  useEffect(() => {
    table.getColumn("tags")?.setFilterValue(selectedTags);
  }, [selectedTags, table]);

  return (
    <div className={"flex flex-row justify-between items-center"}>
      <span>Tags</span>
      <Popover>
        <PopoverTrigger>
          <TbFilter />
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none">
          <MultipleTagPicker
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            tags={tags}
            showSelectAll
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const MemberTagsCell: FC<{
  member: TMemberWithRelation;
  availableTags: TTag[];
  disabled: boolean;
  onPatch: (member: TMemberWithRelation) => Promise<void>;
}> = ({ member, availableTags, disabled, onPatch }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newTagIds, setNewTagIds] = useState<TTagId[]>([]);

  const onDelete = async (deleteTag: TTag) => {
    if (disabled) return;
    const nextMember: TMemberWithRelation = {
      ...member,
      tags: member.tags.filter((tag) => deleteTag.id !== tag.id),
    };
    try {
      await onPatch(nextMember);
    } catch (_error) {
      // Error toast is shown by parent.
    }
  };

  const onAddTags = async () => {
    if (disabled || newTagIds.length === 0) return;

    const existingTagIds = new Set(member.tags.map((t) => t.id));
    const addTags = newTagIds
      .filter((id) => !existingTagIds.has(id))
      .map((id) => availableTags.find((tag) => tag.id === id))
      .filter((tag): tag is TTag => !!tag);

    if (addTags.length === 0) {
      setIsPopoverOpen(false);
      setNewTagIds([]);
      return;
    }

    const nextMember: TMemberWithRelation = {
      ...member,
      tags: [...member.tags, ...addTags],
    };
    try {
      await onPatch(nextMember);
      setIsPopoverOpen(false);
      setNewTagIds([]);
    } catch (_error) {
      // Error toast is shown by parent.
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {member.tags.map((tag) => (
        <TagDisplay
          key={tag.id}
          tag={tag}
          variant="outline"
          onDelete={onDelete}
        />
      ))}
      <Popover
        open={isPopoverOpen}
        onOpenChange={(open) => {
          if (disabled) return;
          setIsPopoverOpen(open);
          if (!open) setNewTagIds([]);
        }}
      >
        <PopoverTrigger asChild>
          <button
            className="border rounded-md px-2 h-[22px]"
            type="button"
            disabled={disabled}
          >
            <TbPlus />
          </button>
        </PopoverTrigger>
        <PopoverContent className="space-y-2">
          <MultipleTagPicker
            tags={availableTags}
            selectedTags={newTagIds}
            onChange={setNewTagIds}
            disabled={disabled}
          />
          <Button
            variant="outline"
            disabled={disabled || !newTagIds.length}
            onClick={() => {
              void onAddTags();
            }}
          >
            追加
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const MemberActionsCell: FC<{
  member: TMemberWithRelation;
  disabled: boolean;
  onPatch: (member: TMemberWithRelation) => Promise<void>;
  onDelete: (memberId: TMemberId) => Promise<void>;
}> = ({ member, disabled, onPatch, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-row space-x-2">
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (disabled) return;
          setIsOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" disabled={disabled}>
            編集
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編集</DialogTitle>
          </DialogHeader>
          <EditMember
            member={member}
            onConfirm={async (updatedMember) => {
              try {
                await onPatch(updatedMember);
                setIsOpen(false);
              } catch (_error) {
                // Error toast is shown by parent.
              }
            }}
            disabled={disabled}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => {
          void onDelete(member.id);
        }}
      >
        削除
      </Button>
    </div>
  );
};

const Footer: FC<{
  table: Table<TMemberWithRelation>;
  tags: TTag[];
  disabled: boolean;
  pendingMemberIds: Set<TMemberId>;
  onDeleteSelected: (members: TMemberWithRelation[]) => Promise<void>;
  onAddTagsSelected: (
    members: TMemberWithRelation[],
    selectedTagIds: TTagId[],
  ) => Promise<void>;
}> = ({
  table,
  tags,
  disabled,
  pendingMemberIds,
  onDeleteSelected,
  onAddTagsSelected,
}) => {
  const selected = table.getSelectedRowModel();
  const [selectedTags, setSelectedTags] = useState<TTagId[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!selected.rows.length) {
    return <div className="h-[40px]">&nbsp;</div>;
  }

  const selectedMembers = selected.rows.map((v) => v.original);
  const hasSelectedPending =
    pendingMemberIds.size > 0 ||
    selectedMembers.some((member) => pendingMemberIds.has(member.id));
  const isFooterDisabled = disabled || hasSelectedPending;

  return (
    <div className="h-[40px]">
      <Button
        variant="outline"
        disabled={isFooterDisabled}
        onClick={() => {
          if (isFooterDisabled) return;
          void onDeleteSelected(selectedMembers);
        }}
      >
        選択した {selected.rows.length} 件を削除
      </Button>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (isFooterDisabled) return;
          setIsDialogOpen(open);
          if (!open) {
            setSelectedTags([]);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isFooterDisabled}>
            選択した {selected.rows.length} 件にタグを追加
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを追加</DialogTitle>
          </DialogHeader>
          <MultipleTagPicker
            tags={tags}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            disabled={isFooterDisabled}
          />
          <Button
            variant="outline"
            disabled={isFooterDisabled || selectedTags.length === 0}
            onClick={async () => {
              if (isFooterDisabled) return;
              await onAddTagsSelected(selectedMembers, selectedTags);
              setIsDialogOpen(false);
              setSelectedTags([]);
            }}
          >
            タグを追加
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

type MemberListProps = {
  namespaceId: TNamespaceId;
  className?: string;
};

export function MemberList({ namespaceId, className }: MemberListProps) {
  const { members, isPending, responseError, mutateMembers } =
    useMembers(namespaceId);
  const { tags } = useTags(namespaceId);
  const { patchMembers } = usePatchMember(namespaceId, { trackLoading: false });
  const { toast } = useToast();
  const [pendingMemberIds, setPendingMemberIds] = useState<Set<TMemberId>>(
    () => new Set(),
  );
  const [isBulkPending, setIsBulkPending] = useState(false);

  const setPendingMembers = useCallback(
    (memberIds: TMemberId[], pending: boolean) => {
      setPendingMemberIds((prev) => {
        const next = new Set(prev);
        for (const memberId of memberIds) {
          if (pending) {
            next.add(memberId);
          } else {
            next.delete(memberId);
          }
        }
        return next;
      });
    },
    [],
  );

  const patchSingleMember = useCallback(
    async (member: TMemberWithRelation) => {
      setPendingMembers([member.id], true);
      try {
        const response = await patchMembers(member.id, member);
        await mutateMembers((current) => {
          if (!current || current.status !== "success") return current;
          return {
            ...current,
            members: current.members.map((item) =>
              item.id === response.member.id ? response.member : item,
            ),
          };
        }, false);
      } catch (error) {
        toast({
          title: "メンバー更新に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
        throw error;
      } finally {
        setPendingMembers([member.id], false);
      }
    },
    [mutateMembers, patchMembers, setPendingMembers, toast],
  );

  const deleteSingleMember = useCallback(
    async (memberId: TMemberId) => {
      setPendingMembers([memberId], true);
      try {
        const response = await deleteMember(namespaceId, memberId);
        if (response.status === "error") {
          throw new Error(response.error);
        }
        await mutateMembers((current) => {
          if (!current || current.status !== "success") return current;
          return {
            ...current,
            members: current.members.filter((member) => member.id !== memberId),
          };
        }, false);
      } catch (error) {
        toast({
          title: "メンバー削除に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
      } finally {
        setPendingMembers([memberId], false);
      }
    },
    [mutateMembers, namespaceId, setPendingMembers, toast],
  );

  const deleteSelectedMembers = useCallback(
    async (selectedMembers: TMemberWithRelation[]) => {
      if (selectedMembers.length === 0) return;
      const selectedIds = selectedMembers.map((member) => member.id);
      if (selectedIds.some((memberId) => pendingMemberIds.has(memberId))) {
        return;
      }
      setIsBulkPending(true);
      setPendingMembers(selectedIds, true);
      try {
        const results = await Promise.all(
          selectedIds.map(async (memberId) => {
            try {
              const response = await deleteMember(namespaceId, memberId);
              return { memberId, response };
            } catch (error) {
              return {
                memberId,
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
          .map((result) => result.memberId);
        const failedMessages = results
          .filter((result) => result.response.status === "error")
          .map((result) =>
            result.response.status === "error" ? result.response.error : "",
          )
          .filter((message) => message.length > 0);

        if (deletedIds.length > 0) {
          await mutateMembers((current) => {
            if (!current || current.status !== "success") return current;
            const deletedSet = new Set(deletedIds);
            return {
              ...current,
              members: current.members.filter(
                (member) => !deletedSet.has(member.id),
              ),
            };
          }, false);
        }

        if (failedMessages.length > 0) {
          throw new Error([...new Set(failedMessages)].join("\n"));
        }
      } catch (error) {
        toast({
          title: "メンバー削除に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
      } finally {
        setPendingMembers(selectedIds, false);
        setIsBulkPending(false);
      }
    },
    [mutateMembers, namespaceId, pendingMemberIds, setPendingMembers, toast],
  );

  const addTagsToSelectedMembers = useCallback(
    async (
      selectedMembers: TMemberWithRelation[],
      selectedTagIds: TTagId[],
    ) => {
      if (selectedMembers.length === 0 || selectedTagIds.length === 0) {
        return;
      }
      const selectedIds = selectedMembers.map((member) => member.id);
      if (selectedIds.some((memberId) => pendingMemberIds.has(memberId))) {
        return;
      }
      const tagById = new Map((tags || []).map((tag) => [tag.id, tag]));
      const patchTargets = selectedMembers
        .map((member) => {
          const existingTagIds = new Set(member.tags.map((tag) => tag.id));
          const addTags = selectedTagIds
            .filter((tagId) => !existingTagIds.has(tagId))
            .map((tagId) => tagById.get(tagId))
            .filter((tag): tag is TTag => !!tag);

          if (addTags.length === 0) {
            return null;
          }
          return {
            ...member,
            tags: [...member.tags, ...addTags],
          };
        })
        .filter((member): member is TMemberWithRelation => !!member);

      if (patchTargets.length === 0) {
        return;
      }

      const targetIds = patchTargets.map((member) => member.id);
      setIsBulkPending(true);
      setPendingMembers(targetIds, true);
      try {
        const results = await Promise.all(
          patchTargets.map(async (member) => {
            try {
              const response = await patchMembers(member.id, member);
              return { status: "success" as const, member: response.member };
            } catch (error) {
              return {
                status: "error" as const,
                error:
                  error instanceof Error
                    ? error.message
                    : "メンバー更新に失敗しました",
              };
            }
          }),
        );
        const updatedMembers = results
          .filter((result) => result.status === "success")
          .map((result) => result.member);
        const failed = results.find((result) => result.status === "error");

        if (updatedMembers.length > 0) {
          const updatedById = new Map(
            updatedMembers.map((member) => [member.id, member]),
          );
          await mutateMembers((current) => {
            if (!current || current.status !== "success") return current;
            return {
              ...current,
              members: current.members.map(
                (member) => updatedById.get(member.id) ?? member,
              ),
            };
          }, false);
        }

        if (failed?.status === "error") {
          throw new Error(failed.error);
        }
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
        setPendingMembers(targetIds, false);
        setIsBulkPending(false);
      }
    },
    [
      mutateMembers,
      patchMembers,
      pendingMemberIds,
      setPendingMembers,
      tags,
      toast,
    ],
  );

  const columns = useMemo<ColumnDef<TMemberWithRelation>[]>(
    () => [
      {
        id: "select",
        header: CommonCheckboxHeader,
        cell: CommonCheckboxCell,
        size: 50,
        maxSize: 50,
      },
      {
        id: "vrchat",
        header: "VRChat",
        cell: ({ row }) => {
          const account = row.original.externalAccounts.find(
            (account) => account.service === "VRCHAT",
          );
          if (!account)
            return <span className="text-gray-400 text-sm">なし</span>;
          return <MemberExternalAccountDisplay data={account} />;
        },
      },
      {
        id: "discord",
        header: "Discord",
        cell: ({ row }) => {
          const account = row.original.externalAccounts.find(
            (account) => account.service === "DISCORD",
          );
          if (!account)
            return <span className="text-gray-400 text-sm">なし</span>;
          return <MemberExternalAccountDisplay data={account} />;
        },
      },
      {
        id: "github",
        header: "GitHub",
        cell: ({ row }) => {
          const account = row.original.externalAccounts.find(
            (account) => account.service === "GITHUB",
          );
          if (!account)
            return <span className="text-gray-400 text-sm">なし</span>;
          return <MemberExternalAccountDisplay data={account} />;
        },
      },
      {
        id: "tags",
        header: TagsHeader,
        cell: ({ row }) => (
          <MemberTagsCell
            member={row.original}
            availableTags={tags || []}
            disabled={isBulkPending || pendingMemberIds.has(row.original.id)}
            onPatch={patchSingleMember}
          />
        ),
        filterFn: (row, id, filterValue) => {
          if (id !== "tags" || !filterValue || !filterValue.length) {
            return true;
          }
          return (filterValue as TTagId[]).some((filterTag) =>
            row.original.tags.some((tag) => tag.id === filterTag),
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <MemberActionsCell
            member={row.original}
            disabled={isBulkPending || pendingMemberIds.has(row.original.id)}
            onPatch={patchSingleMember}
            onDelete={deleteSingleMember}
          />
        ),
      },
    ],
    [
      deleteSingleMember,
      isBulkPending,
      patchSingleMember,
      pendingMemberIds,
      tags,
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
    <div className={className}>
      <DataTable
        columns={columns}
        data={members || []}
        footer={({ table }) => (
          <Footer
            table={table}
            tags={tags || []}
            disabled={isBulkPending}
            pendingMemberIds={pendingMemberIds}
            onDeleteSelected={deleteSelectedMembers}
            onAddTagsSelected={addTagsToSelectedMembers}
          />
        )}
      />
    </div>
  );
}
