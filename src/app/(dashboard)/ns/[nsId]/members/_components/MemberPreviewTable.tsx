import type {
  ResolveResult,
  TResolveRequestType,
} from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ZVRCUserId } from "@/lib/vrchat/types/brand";
import type { ColumnDef } from "@tanstack/react-table";
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "../../components/DataTable";
import { MemberAccountResolveDisplay } from "../../components/MemberAccountResolveDisplay";
import { useMembers } from "../_hooks/use-members";
import { generateMemberPreviewCsv } from "../_utils/generateMemberPreviewCsv";
import type { RowObject } from "./AddPastedMembers";

type TKeys = TResolveRequestType | "unknown";

const KeyServiceMap = {
  DiscordUserId: "Discord",
  DiscordUsername: "Discord",
  VRCUserId: "VRChat",
  GitHubUserId: "GitHub",
  GitHubUsername: "GitHub",
  unknown: "unknown",
};

type Props = {
  nsId: string;
  data: RowObject[];
  keys: TKeys[];
  disabled?: boolean;
  setData: Dispatch<SetStateAction<RowObject[]>>;
};

export const MemberPreviewTable: FC<Props> = ({
  nsId,
  data: data_,
  keys,
  setData,
  disabled,
}) => {
  const { members } = useMembers(nsId);
  const [exporting, setExporting] = useState(false);
  const data = useMemo(() => {
    return data_.map((row) => {
      return {
        ...row,
        data: row.data.map((val, i) => {
          if (keys[i] === "VRCUserId") {
            const parsed = ZVRCUserId.safeParse(val.value);
            if (parsed.success) {
              return {
                value: parsed.data,
              };
            }
            return {
              error: JSON.stringify(parsed.error),
              value: val.value,
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
        header: CommonCheckboxHeader,
        cell: CommonCheckboxCell,
        size: 50,
        maxSize: 50,
      },
      ...keys.map<ColumnDef<RowObject>>((_, index) => {
        return {
          accessorKey: index.toString(),
          header: () => KeyServiceMap[keys[index]],
          cell: ({ row }) => {
            const onResolve = useCallback(
              (data: ResolveResult) => {
                setData((pv) => {
                  const nv = [...pv];
                  nv[row.index].data[index].data = data;
                  return nv;
                });
              },
              [setData, row.index, index],
            );
            if (keys[index] === "unknown") {
              return <div>{row.original.data[index].value}</div>;
            }
            if ("error" in row.original.data[index]) {
              return (
                <div className="text-red-500 truncate overflow-hidden">
                  {row.original.data[index].value}
                </div>
              );
            }
            return (
              <MemberAccountResolveDisplay
                nsId={nsId}
                type={keys[index]}
                serviceId={row.original.data[index].value}
                onResolve={onResolve}
              />
            );
          },
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
            disabled={disabled}
          >
            削除
          </Button>
        ),
        size: 100,
      },
    ];
  }, [keys, setData, nsId, disabled]);
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
            <Button
              className="ml-2"
              variant="outline"
              onClick={async () => {
                setExporting(true);
                try {
                  const csvContent = await generateMemberPreviewCsv({
                    nsId,
                    data,
                    keys,
                    members,
                  });
                  const blob = new Blob([csvContent], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "member-preview.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                } finally {
                  setExporting(false);
                }
              }}
              disabled={disabled || exporting}
            >
              {exporting ? "CSVを生成中..." : "CSVをダウンロード"}
            </Button>
          </div>
        );
      }}
    />
  );
};
