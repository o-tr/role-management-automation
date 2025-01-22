import type { TResolveRequestType } from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ZVRCUserId } from "@/lib/vrchat/types/brand";
import type { ColumnDef } from "@tanstack/react-table";
import { type Dispatch, type FC, type SetStateAction, useMemo } from "react";
import { DataTable } from "../../components/DataTable";
import { MemberAccountResolveDisplay } from "../../components/MemberAccountResolveDisplay";

type TKeys = TResolveRequestType | "unknown";

const KeyServiceMap = {
  DiscordUserId: "Discord",
  DiscordUsername: "Discord",
  VRCUserId: "VRChat",
  GitHubUserId: "GitHub",
  GitHubUsername: "GitHub",
  unknown: "unknown",
};

type InputRowObject = {
  id: string;
  data: string[];
};

type RowObject = {
  id: string;
  data: (
    | string
    | {
        error: string;
        value: string;
      }
  )[];
};

type Props = {
  nsId: string;
  data: InputRowObject[];
  keys: TKeys[];
  setData: Dispatch<SetStateAction<InputRowObject[]>>;
  setKeys: Dispatch<SetStateAction<TKeys[]>>;
};

export const MemberPreviewTable: FC<Props> = ({
  nsId,
  data: data_,
  keys,
  setData,
  setKeys,
}) => {
  const data = useMemo(() => {
    return data_.map((row) => {
      return {
        ...row,
        data: row.data.map((val, i) => {
          if (keys[i] === "VRCUserId") {
            const parsed = ZVRCUserId.safeParse(val);
            if (parsed.success) {
              return parsed.data;
            }
            return {
              error: JSON.stringify(parsed.error),
              value: val,
            };
          }
          return val;
        }),
      };
    });
  }, [data_, keys]);

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
          header: () => KeyServiceMap[keys[index]],
          cell: ({ row }) =>
            keys[index] === "unknown" ? (
              row.original.data[index]
            ) : typeof row.original.data[index] === "object" ? (
              <div className="text-red-500 truncate overflow-hidden">
                {row.original.data[index].value}
              </div>
            ) : (
              <MemberAccountResolveDisplay
                nsId={nsId}
                type={keys[index]}
                serviceId={row.original.data[index]}
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
  }, [keys, setData, nsId]);
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
