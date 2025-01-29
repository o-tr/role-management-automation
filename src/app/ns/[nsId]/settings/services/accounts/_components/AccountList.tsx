"use client";
import { useServiceAccounts } from "@/app/ns/[nsId]/_hooks/use-service-accounts";
import type { FC } from "react";
import { useOnServiceAccountChange } from "../../_hooks/on-accounts-change";

import { Button } from "@/components/ui/button";
import type { FExternalServiceAccount, TNamespaceId } from "@/types/prisma";
import type { ColumnDef } from "@tanstack/react-table";

import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/ns/[nsId]/components/DataTable";
import { Image } from "@/app/ns/[nsId]/components/Image";
import { useDeleteServiceAccount } from "@/app/ns/[nsId]/settings/services/_hooks/use-delete-service-accounts";

type InternalServiceAccount = FExternalServiceAccount & { namespaceId: string };

export const columns: ColumnDef<InternalServiceAccount>[] = [
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
          {row.original.icon && (
            <Image
              src={row.original.icon}
              alt="icon"
              width={24}
              height={24}
              className={"w-8 h-8 rounded-full"}
            />
          )}
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "service",
    header: "Service",
    id: "service",
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { deleteServiceAccount, isPending } = useDeleteServiceAccount();

      return (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            void deleteServiceAccount(row.original.namespaceId, row.original.id)
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

export const AccountList: FC<Props> = ({ nsId }) => {
  const { accounts, isPending, refetch } = useServiceAccounts(nsId);
  useOnServiceAccountChange(() => {
    void refetch();
  });
  const { deleteServiceAccounts } = useDeleteServiceAccount();
  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <DataTable
        columns={columns}
        data={accounts?.map((v) => ({ ...v, namespaceId: nsId })) || []}
        footer={({ table }) => {
          const selected = table.getSelectedRowModel();
          return (
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  deleteServiceAccounts(
                    selected.rows[0].original.namespaceId,
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
