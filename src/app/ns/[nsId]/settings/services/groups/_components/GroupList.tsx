"use client";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import type {
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";

import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/ns/[nsId]/components/DataTable";
import { Image } from "@/app/ns/[nsId]/components/Image";
import { Checkbox } from "@/components/ui/checkbox";
import { useServiceGroups } from "../../../../_hooks/use-service-groups";
import { useOnServiceGroupChange } from "../../_hooks/on-groups-change";
import { useDeleteServiceGroup } from "../../_hooks/use-delete-service-group";

type InternalServiceGroup = TExternalServiceGroupWithAccount & {
  namespaceId: string;
};

export const columns: ColumnDef<InternalServiceGroup>[] = [
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
    size: -1,
    cell: ({ row }) => {
      return (
        <div className={"flex flex-row items-center gap-2"}>
          <Image
            src={row.original.icon || ""}
            alt={row.original.name}
            width={24}
            height={24}
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
            <Image
              src={row.original.account.icon}
              alt={row.original.account.name}
              width={24}
              height={24}
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
  nsId: TNamespaceId;
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
        footer={({ table }) => {
          const selected = table.getSelectedRowModel();
          return (
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  deleteServiceGroups(
                    nsId,
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
};
