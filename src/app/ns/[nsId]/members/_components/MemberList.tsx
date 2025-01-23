"use client";

import { Button } from "@/components/ui/button";
import type { TMember } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteMember } from "@/requests/deleteMember";
import { MemberExternalAccountDisplay } from "../../components/MemberExternalAccountDisplay";
import {
  onMembersChange,
  useOnMembersChange,
} from "../_hooks/on-members-change";
import { useMembers } from "../_hooks/use-tags";

export const columns: ColumnDef<TMember>[] = [
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
      return (
        <div className="flex flex-wrap">
          {row.original.tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-gray-200 px-2 py-1 rounded-full text-sm font-semibold text-gray-700 mr-2"
            >
              {tag.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex flex-row space-x-2">
        <Button variant={"outline"}>編集</Button>
        <Button
          variant="outline"
          onClick={async () => {
            await deleteMember(row.original.namespaceId, row.original.id);
            onMembersChange();
          }}
        >
          削除
        </Button>
      </div>
    ),
  },
];

const deleteMembers = async (groupId: string, tagIds: string[]) => {
  await Promise.all(tagIds.map((tagId) => deleteMember(groupId, tagId)));
};

type MemberListProps = {
  namespaceId: string;
};

export function MemberList({ namespaceId }: MemberListProps) {
  const { members, isPending, refetch } = useMembers(namespaceId);

  useOnMembersChange(refetch);

  if (isPending) {
    return <div>loading...</div>;
  }

  return (
    <div className="mt-6">
      <DataTable
        columns={columns}
        data={members || []}
        deleteSelected={(selected) => {
          deleteMembers(
            namespaceId,
            selected.rows.map((v) => v.original.id),
          );
          onMembersChange();
        }}
      />
    </div>
  );
}
