import {
  DataTable,
  type TColumnDef,
} from "@/app/ns/[nsId]/components/DataTable";
import { MemberExternalAccountDisplay } from "@/app/ns/[nsId]/components/MemberExternalAccountDisplay";
import { TagDisplay } from "@/app/ns/[nsId]/components/TagDisplay";
import type { TMemberWithDiff } from "@/types/diff";
import type { RowModel } from "@tanstack/react-table";
import type { FC } from "react";
import { DIffItemDisplay } from "./DiffItemDisplay";

type InternalTMember = TMemberWithDiff & {
  diff: { success?: boolean }[];
};

export const columns: TColumnDef<InternalTMember>[] = [
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
    widthPercent: 15,
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
    widthPercent: 15,
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
    widthPercent: 15,
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-2">
          {row.original.member.tags.map((tag) => (
            <TagDisplay key={tag.id} tag={tag} />
          ))}
        </div>
      );
    },
    widthPercent: 15,
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

export const MappingDiffList: FC<{
  data: InternalTMember[];
  selected?: FC<{ selected: RowModel<InternalTMember> }>;
}> = ({ data, selected }) => {
  return <DataTable columns={columns} data={data} selected={selected} />;
};
