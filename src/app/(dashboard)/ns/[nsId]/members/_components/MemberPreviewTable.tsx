import type {
  ResolveResponse,
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
} from "react";
import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "../../components/DataTable";
import { MemberAccountResolveDisplay } from "../../components/MemberAccountResolveDisplay";
import { useMembers } from "../_hooks/use-members";
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
                // CSV ヘッダー生成
                const valueHeaderLabel = (key: TKeys): string => {
                  switch (key) {
                    case "VRCUserId":
                      return "vrchat id";
                    case "DiscordUserId":
                      return "discord id";
                    case "DiscordUsername":
                      return "discord username";
                    case "GitHubUserId":
                      return "github id";
                    case "GitHubUsername":
                      return "github username";
                    case "unknown":
                      return "unknown";
                  }
                };
                const statusHeaderLabel = (key: TKeys): string | undefined => {
                  switch (key) {
                    case "VRCUserId":
                      return "vrchat accountの存在";
                    case "DiscordUserId":
                    case "DiscordUsername":
                      return "discord accountの存在";
                    case "GitHubUserId":
                    case "GitHubUsername":
                      return "github accountの存在";
                    default:
                      return undefined;
                  }
                };

                type Status = "登録済み" | "存在する" | "存在しない";

                const escapeCsv = (val: string) => {
                  const s = val ?? "";
                  const escaped = s.replace(/"/g, '""');
                  return `"${escaped}"`;
                };

                const resolveStatus = async (
                  key: TKeys,
                  value: string,
                  existing?: ResolveResult,
                ): Promise<{ status: Status; memberId?: string }> => {
                  if (key === "unknown") return { status: "存在しない" };
                  // 形式エラー扱い
                  if (!existing && key === "VRCUserId") {
                    const parsed = ZVRCUserId.safeParse(value);
                    if (!parsed.success) return { status: "存在しない" };
                  }
                  if (existing) {
                    if (existing.memberId)
                      return {
                        status: "登録済み",
                        memberId: existing.memberId,
                      };
                    return { status: "存在する" };
                  }
                  try {
                    const res = await fetch(
                      `/api/ns/${nsId}/members/resolve/${key}/${encodeURIComponent(
                        value,
                      )}`,
                    );
                    const json: ResolveResponse = await res.json();
                    if (json?.status === "success") {
                      const item: ResolveResult = json.item;
                      if (item.memberId)
                        return { status: "登録済み", memberId: item.memberId };
                      return { status: "存在する" };
                    }
                  } catch (_e) {
                    // noop
                  }
                  return { status: "存在しない" };
                };

                // ヘッダー作成
                const headers: string[] = [];
                for (const k of keys) {
                  headers.push(valueHeaderLabel(k));
                  const h = statusHeaderLabel(k);
                  if (h) headers.push(h);
                }
                headers.push("紐づくタグ");

                const rows: string[] = [headers.map(escapeCsv).join(",")];

                for (const row of data) {
                  const csvRow: string[] = [];
                  let associatedMemberId: string | undefined;
                  for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const cell = row.data[i];
                    const value = cell.value;
                    csvRow.push(escapeCsv(value));

                    if (key !== "unknown") {
                      const existing = (
                        "data" in cell ? cell.data : undefined
                      ) as ResolveResult | undefined;
                      const { status, memberId } = await resolveStatus(
                        key,
                        value,
                        existing,
                      );
                      if (!associatedMemberId && memberId)
                        associatedMemberId = memberId;
                      csvRow.push(escapeCsv(status));
                    }
                  }
                  // 紐づくタグ
                  let tagsLabel = "";
                  if (associatedMemberId && members) {
                    const m = members.find(
                      (mm) => mm.id === associatedMemberId,
                    );
                    if (m?.tags?.length) {
                      tagsLabel = m.tags.map((t) => t.name).join("; ");
                    }
                  }
                  csvRow.push(escapeCsv(tagsLabel));
                  rows.push(csvRow.join(","));
                }

                const csvContent = rows.join("\n");
                const blob = new Blob([csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "member-preview.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={disabled}
            >
              CSVをダウンロード
            </Button>
          </div>
        );
      }}
    />
  );
};
