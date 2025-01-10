"use client";
import { useServiceAccounts } from "@/app/ns/[nsId]/settings/services/_hooks/use-service-accounts";
import type { FC } from "react";
import { useOnServiceAccountChange } from "../../_hooks/on-accounts-change";

import { Button } from "@/components/ui/button";
import type { TServiceAccounts, TTag } from "@/types/prisma";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useDeleteServiceAccount } from "@/app/ns/[nsId]/settings/services/_hooks/use-delete-service-accounts";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InternalServiceAccount = TServiceAccounts & { namespaceId: string };

export const columns: ColumnDef<InternalServiceAccount>[] = [
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
  },
  {
    accessorKey: "service",
    header: "Service",
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

interface DataTableProps {
  columns: ColumnDef<InternalServiceAccount>[];
  data: InternalServiceAccount[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const { deleteServiceAccounts, isPending } = useDeleteServiceAccount();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const selected = table.getSelectedRowModel();

  return (
    <div className={"flex flex-col gap-2 items-start"}>
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const size =
                    columns.find((v) => v.id === header.id)?.size || 0;
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: size > 0 ? size : undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {selected.rows.length > 0 && (
        <Button
          size={"sm"}
          disabled={isPending}
          onClick={() =>
            deleteServiceAccounts(
              selected.rows[0].original.namespaceId,
              selected.rows.map((v) => v.original.id),
            )
          }
        >
          選択済み {selected.rows.length} 件を削除
        </Button>
      )}
    </div>
  );
}

type Props = {
  nsId: string;
};

export const AccountList: FC<Props> = ({ nsId }) => {
  const { accounts, isPending, refetch } = useServiceAccounts(nsId);
  useOnServiceAccountChange(() => {
    void refetch();
  });
  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <DataTable
        columns={columns}
        data={accounts.map((v) => ({ ...v, namespaceId: nsId }))}
      />
    </div>
  );
};
