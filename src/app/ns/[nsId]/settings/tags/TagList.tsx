"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TTag } from "@/types/prisma";
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
import { useNamespace } from "@/hooks/use-namespace";
import { createTag } from "@/requests/createTag";
import { deleteTag } from "@/requests/deleteTag";

type InternalTag = TTag & { namespaceId: string };

export const columns: ColumnDef<InternalTag>[] = [
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
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="outline"
        onClick={() =>
          void deleteTag(row.original.namespaceId, row.original.id)
        }
      >
        削除
      </Button>
    ),
    size: 100,
  },
];

const deleteTags = async (groupId: string, tagIds: string[]) => {
  await Promise.all(tagIds.map((tagId) => deleteTag(groupId, tagId)));
};

interface DataTableProps {
  columns: ColumnDef<InternalTag>[];
  data: InternalTag[];
}

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
            deleteTags(
              selected.rows[0].original.namespaceId,
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

type TagListProps = {
  namespaceId: string;
};

export default function TagList({ namespaceId }: TagListProps) {
  const { namespace, isPending, refetch } = useNamespace({ namespaceId });
  const [newTagName, setNewTagName] = useState("");

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namespace) return;
    createTag(namespace.id, newTagName);
    void refetch();
    setNewTagName("");
  };

  if (isPending || !namespace) return <div>Loading...</div>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">タグ</h2>
      <DataTable
        columns={columns}
        data={namespace.tags.map((v) => ({ ...v, namespaceId }))}
      />
      <form onSubmit={handleAddTag} className="mt-4 flex space-x-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="新しいタグ名"
          required
        />
        <Button type="submit">追加</Button>
      </form>
    </div>
  );
}
