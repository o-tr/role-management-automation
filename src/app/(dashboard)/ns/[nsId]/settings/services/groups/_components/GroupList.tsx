"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { redirect } from "next/navigation";
import type { FC } from "react";
import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/(dashboard)/ns/[nsId]/components/DataTable";
import { Image } from "@/app/(dashboard)/ns/[nsId]/components/Image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type {
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";
import { useServiceGroups } from "../../../../_hooks/use-service-groups";
import { useOnServiceGroupChange } from "../../_hooks/on-groups-change";
import { useDeleteServiceGroup } from "../../_hooks/use-delete-service-group";

type InternalServiceGroup = TExternalServiceGroupWithAccount & {
  namespaceId: string;
};

type RowActionsProps = {
  row: InternalServiceGroup;
};

const RowActionsCell: FC<RowActionsProps> = ({ row }) => {
  const { deleteServiceGroup, isPending } = useDeleteServiceGroup(
    row.namespaceId,
  );
  const { toast } = useToast();

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={async () => {
        try {
          await deleteServiceGroup(row.account.id, row.id);
        } catch (error) {
          toast({
            title: "グループ削除に失敗しました",
            description:
              error instanceof Error
                ? error.message
                : "しばらくしてから再度お試しください。",
            variant: "destructive",
          });
        }
      }}
    >
      削除
    </Button>
  );
};

const baseColumns: ColumnDef<InternalServiceGroup>[] = [
  {
    id: "select",
    header: CommonCheckboxHeader,
    cell: CommonCheckboxCell,
    size: 50,
    maxSize: 50,
  },
  {
    accessorKey: "name",
    header: "Name",
    size: -1,
    cell: ({ row }) => {
      return (
        <div className={"flex flex-row items-center gap-2"}>
          <Image
            src={row.original.icon || ""}
            alt={row.original.name}
            width={24}
            height={24}
            className={"w-8 h-8 rounded-full"}
          />
          <span>{row.original.name}</span>
        </div>
      );
    },
  },
  {
    id: "account",
    header: "Account",
    size: 200,
    cell: ({ row }) => {
      return (
        <div className={"flex flex-row items-center gap-2"}>
          {row.original.account.icon && (
            <Image
              src={row.original.account.icon}
              alt={row.original.account.name}
              width={24}
              height={24}
              className={"w-8 h-8 rounded-full"}
            />
          )}
          <span>{row.original.account.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "account.service",
    header: "Service",
    id: "service",
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActionsCell row={row.original} />,
    size: 100,
  },
];

type Props = {
  nsId: TNamespaceId;
};

export const GroupList: FC<Props> = ({ nsId }) => {
  const { groups, isPending, refetch, responseError } = useServiceGroups(nsId);
  const { toast } = useToast();
  useOnServiceGroupChange(() => {
    void refetch();
  });
  const { deleteServiceGroups, isPending: isDeleting } =
    useDeleteServiceGroup(nsId);
  if (isPending) {
    return <div>Loading...</div>;
  }

  if (responseError) {
    if (responseError.code === 401) {
      redirect("/");
      return null;
    }
    if (responseError.code === 403) {
      redirect(`/ns/${nsId}`);
      return null;
    }
    if (responseError.code === 404) {
      redirect("/ns");
      return null;
    }
    return <div>エラーが発生しました</div>;
  }

  return (
    <div>
      <DataTable
        columns={baseColumns}
        data={groups?.map((v) => ({ ...v, namespaceId: nsId })) || []}
        footer={({ table }) => {
          const selected = table.getSelectedRowModel();
          return (
            <div>
              <Button
                variant="outline"
                disabled={isDeleting || selected.rows.length === 0}
                onClick={async () => {
                  if (selected.rows.length === 0) return;
                  try {
                    const groupedIdsByAccount = new Map<string, string[]>();
                    for (const row of selected.rows) {
                      const accountId = row.original.account.id;
                      if (!groupedIdsByAccount.has(accountId)) {
                        groupedIdsByAccount.set(accountId, []);
                      }
                      groupedIdsByAccount.get(accountId)?.push(row.original.id);
                    }

                    await Promise.all(
                      [...groupedIdsByAccount.entries()].map(
                        ([accountId, groupIds]) =>
                          deleteServiceGroups(accountId, groupIds),
                      ),
                    );
                  } catch (error) {
                    toast({
                      title: "グループ削除に失敗しました",
                      description:
                        error instanceof Error
                          ? error.message
                          : "しばらくしてから再度お試しください。",
                      variant: "destructive",
                    });
                  }
                }}
              >
                選択した {selected.rows.length} 件を削除
              </Button>
            </div>
          );
        }}
      />
    </div>
  );
};
