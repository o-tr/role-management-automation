"use client";

import { Button } from "@/components/ui/button";
import type {
  TMemberWithRelation,
  TNamespaceId,
  TTag,
  TTagId,
} from "@/types/prisma";
import type { ColumnDef, RowModel } from "@tanstack/react-table";

import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { type FC, useCallback, useState } from "react";
import { TbPlus } from "react-icons/tb";
import { MemberExternalAccountDisplay } from "../../components/MemberExternalAccountDisplay";
import { MultipleTagPicker } from "../../components/MultipleTagPicker";
import { TagDisplay } from "../../components/TagDisplay";
import { useTags } from "../../roles/_hooks/use-tags";
import {
  onMembersChange,
  useOnMembersChange,
} from "../_hooks/on-members-change";
import { usePatchMember } from "../_hooks/use-patch-member";
import { useMembers } from "../_hooks/use-tags";
import { AddTag } from "./EditMember/AddTag";
import { EditMember } from "./EditMember/EditMember";

export const columns: ColumnDef<TMemberWithRelation>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className={"grid place-items-center"}>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className={"grid place-items-center"}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
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
      if (!account) return null;
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
      if (!account) return null;
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
      if (!account) return null;
      return <MemberExternalAccountDisplay data={account} />;
    },
  },
  {
    id: "tags",
    header: "Tags",
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
};

type TagSelectorProps = {
  namespaceId: string;
  selectedTags: string[];
  onChange: (tags: string[]) => void;
};

const TagSelector = ({
  namespaceId,
  selectedTags,
  onChange,
}: TagSelectorProps) => {
  const { tags } = useTags(namespaceId);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="">
      <input
        className="border-none outline-none bg-none"
        value={query}
        onChange={(v) => setQuery(v.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <Command>
        <CommandList>
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {tags?.map((tag) => (
              <CommandItem
                key={tag.id}
                onSelect={() => onChange([...selectedTags, tag.id])}
              >
                {tag.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export function MemberList({ namespaceId }: MemberListProps) {
  const { members, isPending, refetch } = useMembers(namespaceId);

  useOnMembersChange(refetch);

  const Selected = useCallback<FC<{ selected: RowModel<TMemberWithRelation> }>>(
    ({ selected }) => {
      const { patchMembers } = usePatchMember(namespaceId);
      const [selectedTags, setSelectedTags] = useState<string[]>([]);
      return (
        <div>
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
              <MultipleTagPicker
                namespacedId={namespaceId}
                onChange={setSelectedTags}
              />
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

  return (
    <div className="mt-6">
      <DataTable columns={columns} data={members || []} selected={Selected} />
    </div>
  );
}
