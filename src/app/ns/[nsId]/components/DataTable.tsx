import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type ColumnDef,
  type Row,
  type RowModel,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";

export type TColumnDef<T> = ColumnDef<T> & {
  widthPercent?: number;
};

interface DataTableProps<T> {
  columns: TColumnDef<T>[];
  data: T[];
  selected?: FC<{ selected: RowModel<T> }>;
  className?: string;
  calcRowClassName?: (row: Row<T>) => string;
}

export function DataTable<T>({
  columns,
  data,
  selected: Selected,
  className,
  calcRowClassName,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const selected = table.getSelectedRowModel();

  return (
    <div className={cn("flex flex-col gap-2 items-start", className)}>
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = columns.find((v) => v.id === header.id);

                  const size = column?.size ? `${column.size}px` : undefined;
                  const sizePercent = column?.widthPercent
                    ? `${column.widthPercent}%`
                    : undefined;
                  const maxSize = column?.maxSize
                    ? `${column.maxSize}px`
                    : undefined;

                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: size || sizePercent,
                        maxWidth: maxSize,
                      }}
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
                  className={calcRowClassName?.(row)}
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
      {selected.rows.length > 0 && Selected && <Selected selected={selected} />}
    </div>
  );
}
