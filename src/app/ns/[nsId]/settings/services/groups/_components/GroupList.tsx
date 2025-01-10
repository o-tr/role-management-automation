"use client";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import type { TExternalServiceGroupDetail } from "@/types/prisma";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOnServiceGroupChange } from "../../_hooks/on-groups-change";
import { useDeleteServiceGroup } from "../../_hooks/use-delete-service-group";
import { useServiceGroups } from "../../_hooks/use-service-groups";

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
      const { deleteServiceGroup, isPending } = useDeleteServiceGroup();

      return (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            void deleteServiceGroup(row.original.namespaceId, row.original.id)
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
  columns: ColumnDef<InternalServiceGroup>[];
  data: InternalServiceGroup[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const { deleteServiceGroups, isPending } = useDeleteServiceGroup();
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
            deleteServiceGroups(
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

export const GroupList: FC<Props> = ({ nsId }) => {
  const { groups, isPending, refetch } = useServiceGroups(nsId);
  useOnServiceGroupChange(() => {
    void refetch();
  });
  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <DataTable
        columns={columns}
        data={groups.map((v) => ({ ...v, namespaceId: nsId }))}
      />
    </div>
  );
};
