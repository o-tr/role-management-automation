import {
  type CellContext,
  type ColumnDef,
  type ColumnDefTemplate,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type RowModel,
  type SortingState,
  type StringOrTemplateHeader,
  type Table as TableType,
  useReactTable,
} from "@tanstack/react-table";
import { type FC, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import styles from "./DataTable.module.css";

export type TColumnDef<T> = ColumnDef<T> & {
  widthPercent?: number;
};

interface DataTableProps<T> {
  columns: TColumnDef<T>[];
  data: T[];
  header?: FC<{ table: TableType<T> }>;
  footer?: FC<{ table: TableType<T> }>;
  className?: string;
  calcRowClassName?: (row: Row<T>) => string;
  getFilteredRowModel?: (data: TableType<T>) => () => RowModel<T>;
}

export function DataTable<T>({
  columns,
  data,
  header: Header,
  footer: Footer,
  className,
  calcRowClassName,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-start overflow-y-hidden h-full",
        className,
      )}
    >
      {Header && <Header table={table} />}
      <div className="rounded-md border overflow-y-hidden flex flex-col">
        <Table className="table-fixed overflow-y-auto">
          <TableHeader className={`sticky top-0 z-10 ${styles.rowSeparator}`}>
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
                      className={styles.colSeparator}
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
      {Footer && <Footer table={table} />}
    </div>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: tmp;
export const CommonCheckboxHeader: StringOrTemplateHeader<any, any> = ({
  table,
}) => {
  return (
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
  );
};

export const CommonCheckboxCell: ColumnDefTemplate<
  // biome-ignore lint/suspicious/noExplicitAny: tmp;
  CellContext<any, any>
> = ({ row }) => {
  return (
    <div className={"grid place-items-center"}>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    </div>
  );
};
