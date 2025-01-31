import type { AdminItem } from "@/app/api/ns/[nsId]/admins/route";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TNamespaceId } from "@/types/prisma";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import { DataTable, type TColumnDef } from "../../../components/DataTable";
import { UserDisplay } from "../../../components/UserDisplay";
import { useAdmins } from "../_hooks/useAdmins";
import { useDeleteAdmin } from "../_hooks/useDeleteAdmin";
import { useTransferOwner } from "../_hooks/useTransferOwner";

type Props = {
  nsId: TNamespaceId;
};

const columns: TColumnDef<AdminItem>[] = [
  {
    id: "name",
    header: "名前",
    cell: ({ row }) => <UserDisplay account={row.original} />,
  },
  {
    id: "permission",
    header: "権限",
    cell: ({ row }) => <div>{row.original.isOwner ? "所有者" : "管理者"}</div>,
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const { deleteAdmin, isPending: isDeletePending } = useDeleteAdmin(
        row.original.namespaceId,
      );
      const { transferOwner, isPending: isTransferPending } = useTransferOwner(
        row.original.namespaceId,
      );
      const router = useRouter();
      const handleDelete = async () => {
        await deleteAdmin(row.original.id);
      };
      const handleTransfer = async () => {
        await transferOwner(row.original.id);
        router.push(`/ns/${row.original.namespaceId}`);
      };
      return (
        <div className="flex flex-row gap-2" key={row.original.id}>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={"destructive"}
                disabled={
                  isDeletePending || isTransferPending || row.original.isOwner
                }
              >
                削除
              </Button>
            </DialogTrigger>
            <DialogContent className="w-auto">
              <DialogHeader>
                <DialogTitle>本当に削除しますか？</DialogTitle>
              </DialogHeader>
              <UserDisplay account={row.original} />
              <div>
                <p>
                  管理者を削除すると、そのユーザーはネームスペースにアクセスできなくなります
                </p>
                <p>再度追加するには、招待を送信する必要があります</p>
              </div>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button>キャンセル</Button>
                </DialogTrigger>
                <Button
                  variant={"destructive"}
                  onClick={handleDelete}
                  disabled={
                    isDeletePending || isTransferPending || row.original.isOwner
                  }
                >
                  削除
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={"destructive"}
                disabled={
                  isDeletePending || isTransferPending || row.original.isOwner
                }
              >
                所有権を譲渡
              </Button>
            </DialogTrigger>
            <DialogContent className="w-auto">
              <DialogHeader>
                <DialogTitle>所有権を譲渡しますか？</DialogTitle>
              </DialogHeader>
              <UserDisplay account={row.original} />
              <div>
                <p>
                  所有権を譲渡すると、そのユーザーがネームスペースの所有者になります
                </p>
                <p>
                  再度所有者になるには譲渡相手から、再度所有権の譲渡を受ける必要があります
                </p>
                <p>
                  譲渡すると、あなたは管理者になり、この画面にはアクセスできなくなります
                </p>
              </div>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button>キャンセル</Button>
                </DialogTrigger>
                <Button
                  variant={"destructive"}
                  onClick={handleTransfer}
                  disabled={
                    isDeletePending || isTransferPending || row.original.isOwner
                  }
                >
                  譲渡
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
    size: 250,
  },
];

export const AdminsList: FC<Props> = ({ nsId }) => {
  const { data, isLoading } = useAdmins(nsId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || data.status !== "success") {
    return <div>Failed to load admins</div>;
  }

  return <DataTable columns={columns} data={data?.admins || []} />;
};
