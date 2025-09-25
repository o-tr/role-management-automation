import type { TResolveRequestType } from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import { Button } from "@/components/ui/button";
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
import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "../../components/DataTable";
import type { RowObject } from "./AddPastedMembers";

type TKeys = TResolveRequestType | "unknown";

const Keys = [
  "DiscordUserId",
  "DiscordUsername",
  "VRCUserId",
  "GitHubUserId",
  "GitHubUsername",
  "unknown",
];

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
        header: CommonCheckboxHeader,
        cell: CommonCheckboxCell,
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
              value={row.original.data[index].value}
              onChange={(e) =>
                setData((pv) => {
                  const nv = [...pv];
                  const item = nv.find((r) => r.id === row.original.id);
                  if (!item) return pv;
                  item.data[index] = { value: e.target.value };
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
      footer={({ table }) => {
        const selected = table.getSelectedRowModel();
        return (
          <div>
            <Button
              variant="outline"
              onClick={() => {
                const selectedIndexes = selected.rows.map((row) => row.index);
                setData((pv) =>
                  pv.filter((_, i) => !selectedIndexes.includes(i)),
                );
              }}
            >
              選択した {selected.rows.length} 件を削除
            </Button>
          </div>
        );
      }}
    />
  );
};
