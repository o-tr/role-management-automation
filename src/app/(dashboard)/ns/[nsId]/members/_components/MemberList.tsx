"use client";

import { Button } from "@/components/ui/button";
import type {
  TMemberWithRelation,
  TNamespaceId,
  TTag,
  TTagId,
} from "@/types/prisma";
import type {
  ColumnDef,
  StringOrTemplateHeader,
  Table,
} from "@tanstack/react-table";

import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/(dashboard)/ns/[nsId]/components/DataTable";
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
import { deleteMember } from "@/requests/deleteMember";
import { redirect } from "next/navigation";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { TbFilter, TbPlus } from "react-icons/tb";
import { MemberExternalAccountDisplay } from "../../components/MemberExternalAccountDisplay";
import { MultipleTagPicker } from "../../components/MultipleTagPicker";
import { TagDisplay } from "../../components/TagDisplay";
import { useTags } from "../../roles/_hooks/use-tags";
import {
  onMembersChange,
  useOnMembersChange,
} from "../_hooks/on-members-change";
import { useMembers } from "../_hooks/use-members";
import { usePatchMember } from "../_hooks/use-patch-member";
import { AddTag } from "./EditMember/AddTag";
import { EditMember } from "./EditMember/EditMember";

const TagsHeader: StringOrTemplateHeader<TMemberWithRelation, unknown> = ({
  table,
}) => {
  const rows = table.getCoreRowModel().rows;
  const tags = useMemo(
    () =>
      rows
        .flatMap((row) => row.original.tags)
        .reduce<TTag[]>((acc, tag) => {
          if (!acc.find((t) => t.id === tag.id)) {
            acc.push(tag);
          }
          return acc;
        }, [])
        .sort((a, b) => a.name.localeCompare(b.name)),
    [rows],
  );
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

export const columns: ColumnDef<TMemberWithRelation>[] = [
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
      if (!account) return <span className="text-gray-400 text-sm">なし</span>;
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
      if (!account) return <span className="text-gray-400 text-sm">なし</span>;
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
      if (!account) return <span className="text-gray-400 text-sm">なし</span>;
      return <MemberExternalAccountDisplay data={account} />;
    },
  },
  {
    id: "tags",
    header: TagsHeader,
    cell: ({ row }) => {
      const { patchMembers, loading } = usePatchMember(
        row.original.namespaceId,
      );

      const onDelete = async (deleteTag: TTag) => {
        row.original.tags = row.original.tags.filter(
          (tag) => deleteTag.id !== tag.id,
        );
        await patchMembers(row.original.id, row.original);
        onMembersChange();
      };

      const [isPopoverOpen, setIsPopoverOpen] = useState(false);

      return (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag) => (
            <TagDisplay
              key={tag.id}
              tag={tag}
              variant="outline"
              onDelete={onDelete}
            />
          ))}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="border rounded-md px-2 h-[22px]" type="button">
                <TbPlus />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <AddTag
                member={row.original}
                onConfirm={async (tag) => {
                  const member = { ...row.original };
                  member.tags.push({
                    ...tag,
                    namespaceId: row.original.namespaceId,
                  });
                  await patchMembers(member.id, member);
                  onMembersChange();
                  setIsPopoverOpen(false);
                }}
                disabled={loading}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    },
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
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false);
      const { patchMembers, loading } = usePatchMember(
        row.original.namespaceId,
      );
      const onConfirm = async (member: TMemberWithRelation) => {
        setIsOpen(false);
        await patchMembers(member.id, member);
        onMembersChange();
      };
      return (
        <div className="flex flex-row space-x-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">編集</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>編集</DialogTitle>
              </DialogHeader>
              <EditMember
                member={row.original}
                onConfirm={onConfirm}
                disabled={loading}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            disabled={loading}
            onClick={async () => {
              await deleteMember(row.original.namespaceId, row.original.id);
              onMembersChange();
            }}
          >
            削除
          </Button>
        </div>
      );
    },
  },
];

const deleteMembers = async (groupId: string, tagIds: string[]) => {
  await Promise.all(tagIds.map((tagId) => deleteMember(groupId, tagId)));
};

type MemberListProps = {
  namespaceId: TNamespaceId;
  className?: string;
};

export function MemberList({ namespaceId, className }: MemberListProps) {
  const { members, isPending, responseError } = useMembers(namespaceId);
  const [showDeletedAccounts, setShowDeletedAccounts] = useState(false);

  // フィルタリングされたメンバーデータ
  const filteredMembers = useMemo(() => {
    if (!members) return [];

    if (showDeletedAccounts) {
      return members; // 削除されたアカウントも含めて全て表示
    }

    // 削除されたアカウントのみのメンバーを除外し、アクティブなアカウントを持つメンバーのみ表示
    return members.filter((member) =>
      member.externalAccounts.some((account) => account.status === "ACTIVE"),
    );
  }, [members, showDeletedAccounts]);

  const Footer = useCallback<FC<{ table: Table<TMemberWithRelation> }>>(
    ({ table }) => {
      const { patchMembers } = usePatchMember(namespaceId);
      const { tags } = useTags(namespaceId);
      const selected = table.getSelectedRowModel();
      const [selectedTags, setSelectedTags] = useState<TTagId[]>([]);
      if (!selected.rows.length) {
        return <div className="h-[40px]">&nbsp;</div>;
      }

      return (
        <div className="h-[40px]">
          <Button
            variant="outline"
            onClick={async () => {
              await deleteMembers(
                namespaceId,
                selected.rows.map((v) => v.original.id),
              );
              onMembersChange();
            }}
          >
            選択した {selected.rows.length} 件を削除
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                選択した {selected.rows.length} 件にタグを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>タグを追加</DialogTitle>
              </DialogHeader>
              {tags && (
                <MultipleTagPicker
                  tags={tags}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              )}
              <Button
                variant="outline"
                onClick={async () => {
                  await Promise.all(
                    selected.rows.map(({ original: member }) => {
                      member.tags = [
                        ...member.tags,
                        ...selectedTags.map((tagId) => ({
                          id: tagId as TTagId,
                          name: "",
                          namespaceId: namespaceId,
                        })),
                      ];
                      return patchMembers(member.id, member);
                    }),
                  );
                  onMembersChange();
                }}
              >
                タグを追加
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
    [namespaceId],
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
      <DataTable columns={columns} data={filteredMembers} footer={Footer} />
    </div>
  );
}
