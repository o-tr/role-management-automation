import type { TResolveRequestType } from "@/app/api/ns/[nsId]/members/resolve/route";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import { type Dispatch, type FC, type SetStateAction, useMemo } from "react";
import { DataTable } from "../../components/DataTable";

type TKeys = TResolveRequestType | "unknown";

const Keys = [
  "DiscordUserId",
  "DiscordUsername",
  "VRCUserId",
  "GitHubUserId",
  "GitHubUsername",
  "unknown",
];

type RowObject = {
  id: string;
  data: string[];
};

type Props = {
  data: RowObject[];
  keys: TKeys[];
  setData: Dispatch<SetStateAction<RowObject[]>>;
  setKeys: Dispatch<SetStateAction<TKeys[]>>;
};

export const PastedTable: FC<Props> = ({ data, keys, setData, setKeys }) => {
  const columns = useMemo<ColumnDef<RowObject>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <div className={"grid place-items-center"}>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
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
      ...keys.map<ColumnDef<RowObject>>((_, index) => {
        return {
          accessorKey: index.toString(),
          header: () => (
            <Select
              value={keys[index]}
              onValueChange={(val) =>
                setKeys((pv) => {
                  const nv = [...pv];
                  nv[index] = val as TKeys;
                  return nv;
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {Keys.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
          cell: ({ row }) => (
            <Input
              value={row.original.data[index]}
              onChange={(e) =>
                setData((pv) => {
                  const nv = [...pv];
                  const item = nv.find((r) => r.id === row.original.id);
                  if (!item) return pv;
                  item.data[index] = e.target.value;
                  return nv;
                })
              }
            />
          ),
          size: -1,
        };
      }),
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant={"outline"}
            onClick={() => {
              setData((pv) => pv.filter((_, i) => i !== row.index));
            }}
          >
            削除
          </Button>
        ),
        size: 100,
      },
    ];
  }, [keys, setData, setKeys]);
  return (
    <DataTable
      columns={columns}
      data={data}
      deleteSelected={(selected) => {
        const selectedIndexes = selected.rows.map((row) => row.index);
        setData((pv) => pv.filter((_, i) => !selectedIndexes.includes(i)));
      }}
    />
  );
};
