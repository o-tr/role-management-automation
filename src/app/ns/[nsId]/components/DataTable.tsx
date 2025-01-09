"use client";

import { Button } from "@/components/ui/button";
import { ExternalProvider } from "@prisma/client";
import { removeExternalProvider } from "../../actions";
import { GroupId } from "@/types/brandTypes";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

type TExternalProvider = ExternalProvider & { groupId: GroupId };

interface DataTableProps {
  columns: ColumnDef<TExternalProvider>[];
  data: TExternalProvider[];
}

const deleteProviders = async (groupId: GroupId, providerIds: string[]) => {
  await Promise.all(
    providerIds.map((providerId) => removeExternalProvider(groupId, providerId))
  );
};

export function DataTable({ columns, data }: DataTableProps) {
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
                            header.getContext()
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
                        cell.getContext()
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
          onClick={() =>
            deleteProviders(
              selected.rows[0].original.groupId,
              selected.rows.map((v) => v.original.id)
            )
          }
        >
          選択済み {selected.rows.length} 件を削除
        </Button>
      )}
    </div>
  );
}
