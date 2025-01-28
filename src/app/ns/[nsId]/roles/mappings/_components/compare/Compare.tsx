import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { MemberExternalAccountDisplay } from "@/app/ns/[nsId]/components/MemberExternalAccountDisplay";
import { Checkbox } from "@/components/ui/checkbox";
import type { TNamespaceId } from "@/types/prisma";
import type { ColumnDef, RowModel } from "@tanstack/react-table";
import type { FC } from "react";
import { DIffItemDisplay } from "./DiffItemDisplay";
import { type TMemberWithDiff, useCompare } from "./_hooks/useCompare";

type Props = {
  nsId: TNamespaceId;
};

export const columns: ColumnDef<TMemberWithDiff>[] = [
  {
    id: "vrchat",
    header: "VRChat",
    cell: ({ row }) => {
      const account = row.original.member.externalAccounts.find(
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
      const account = row.original.member.externalAccounts.find(
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
      const account = row.original.member.externalAccounts.find(
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
          {row.original.member.tags.map((tag) => (
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
    id: "diff",
    header: "Diff",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-2">
          {row.original.diff.map((diff) => (
            <DIffItemDisplay key={diff.groupMember.serviceId} item={diff} />
          ))}
        </div>
      );
    },
  },
];

const Selected: FC<{ selected: RowModel<TMemberWithDiff> }> = ({
  selected,
}) => {
  return <div />;
};

export const Compare: FC<Props> = ({ nsId }) => {
  const { isPending, diff } = useCompare(nsId);
  if (isPending) {
    return <div>Loading...</div>;
  }

  return <DataTable columns={columns} data={diff || []} selected={Selected} />;
};
