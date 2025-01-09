"use client";

import { EditExternalProviderForm } from "@/app/ns/[nsId]/components/EditExternalProviderForm";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { GroupId } from "@/types/brandTypes";
import type { ExternalProvider } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { removeExternalProvider } from "../../actions";

type TExternalProvider = ExternalProvider & { groupId: GroupId };

export const columns: ColumnDef<TExternalProvider>[] = [
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
      <div className="flex space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">編集</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>プロバイダーを編集</DialogTitle>
            </DialogHeader>
            <EditExternalProviderForm provider={row.original} />
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          onClick={() =>
            void removeExternalProvider(row.original.groupId, row.original.id)
          }
        >
          削除
        </Button>
      </div>
    ),
    size: 150,
  },
];
