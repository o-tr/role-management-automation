"use client";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import type { TExternalServiceGroupDetail } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/app/ns/[nsId]/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useServiceGroups } from "../../../../_hooks/use-service-groups";
import { useOnServiceGroupChange } from "../../_hooks/on-groups-change";
import { useDeleteServiceGroup } from "../../_hooks/use-delete-service-group";

type InternalServiceGroup = TExternalServiceGroupDetail & {
  namespaceId: string;
};

export const columns: ColumnDef<InternalServiceGroup>[] = [
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
    accessorKey: "name",
    header: "Name",
    size: -1,
    cell: ({ row }) => {
      return (
        <div className={"flex flex-row items-center gap-2"}>
          <img
            src={row.original.icon}
            alt={row.original.name}
            className={"w-8 h-8 rounded-full"}
          />
          <span>{row.original.name}</span>
        </div>
      );
    },
  },
  {
    id: "account",
    header: "Account",
    size: 200,
    cell: ({ row }) => {
      return (
        <div className={"flex flex-row items-center gap-2"}>
          {row.original.account.icon && (
            <img
              src={row.original.account.icon}
              alt={row.original.account.name}
              className={"w-8 h-8 rounded-full"}
            />
          )}
          <span>{row.original.account.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "account.service",
    header: "Service",
    id: "service",
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { deleteServiceGroup, isPending } = useDeleteServiceGroup(
        row.original.namespaceId,
      );

      return (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            void deleteServiceGroup(row.original.account.id, row.original.id)
          }
        >
          削除
        </Button>
      );
    },
    size: 100,
  },
];

type Props = {
  nsId: string;
};

export const GroupList: FC<Props> = ({ nsId }) => {
  const { groups, isPending, refetch } = useServiceGroups(nsId);
  useOnServiceGroupChange(() => {
    void refetch();
  });
  const { deleteServiceGroups } = useDeleteServiceGroup(nsId);
  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <DataTable
        columns={columns}
        data={groups?.map((v) => ({ ...v, namespaceId: nsId })) || []}
        deleteSelected={(selected) => {
          deleteServiceGroups(
            nsId,
            selected.rows.map((v) => v.original.id),
          );
        }}
      />
    </div>
  );
};
