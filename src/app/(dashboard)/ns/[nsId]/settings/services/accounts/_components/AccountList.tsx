"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { redirect } from "next/navigation";
import { type FC, useMemo } from "react";
import { useServiceAccounts } from "@/app/(dashboard)/ns/[nsId]/_hooks/use-service-accounts";
import {
  CommonCheckboxCell,
  CommonCheckboxHeader,
  DataTable,
} from "@/app/(dashboard)/ns/[nsId]/components/DataTable";
import { Image } from "@/app/(dashboard)/ns/[nsId]/components/Image";
import { useDeleteServiceAccount } from "@/app/(dashboard)/ns/[nsId]/settings/services/_hooks/use-delete-service-accounts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { FExternalServiceAccount, TNamespaceId } from "@/types/prisma";
import { useOnServiceAccountChange } from "../../_hooks/on-accounts-change";

type InternalServiceAccount = FExternalServiceAccount & { namespaceId: string };

type RowActionsProps = {
  row: InternalServiceAccount;
};

const RowActionsCell: FC<RowActionsProps> = ({ row }) => {
  const { deleteServiceAccount, isPending } = useDeleteServiceAccount();
  const { toast } = useToast();

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={async () => {
        try {
          await deleteServiceAccount(row.namespaceId, row.id);
        } catch (error) {
          toast({
            title: "アカウント削除に失敗しました",
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

const baseColumns: ColumnDef<InternalServiceAccount>[] = [
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
          {row.original.icon && (
            <Image
              src={row.original.icon}
              alt="icon"
              width={24}
              height={24}
              className={"w-8 h-8 rounded-full"}
            />
          )}
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "service",
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

export const AccountList: FC<Props> = ({ nsId }) => {
  const { accounts, responseError, isPending, refetch } =
    useServiceAccounts(nsId);
  const { toast } = useToast();
  useOnServiceAccountChange(() => {
    void refetch();
  });
  const { deleteServiceAccounts, isPending: isDeleting } =
    useDeleteServiceAccount();
  const tableColumns = useMemo<ColumnDef<InternalServiceAccount>[]>(
    () =>
      baseColumns.map((column) =>
        column.id === "actions"
          ? {
              ...column,
              cell: ({ row }) => (
                <RowActionsCell
                  row={{
                    ...row.original,
                    namespaceId: nsId,
                  }}
                />
              ),
            }
          : column,
      ),
    [nsId],
  );
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
    return <div>Error</div>;
  }

  return (
    <div>
      <DataTable
        columns={tableColumns}
        data={accounts?.map((v) => ({ ...v, namespaceId: nsId })) || []}
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
                    await deleteServiceAccounts(
                      selected.rows[0].original.namespaceId,
                      selected.rows.map((v) => v.original.id),
                    );
                  } catch (error) {
                    toast({
                      title: "アカウント削除に失敗しました",
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
