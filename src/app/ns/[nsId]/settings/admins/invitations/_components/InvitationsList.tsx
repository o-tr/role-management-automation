import { Button } from "@/components/ui/button";
import type { TNamespaceId, TNamespaceInvitation } from "@/types/prisma";
import { useState } from "react";
import { TbCopy, TbCopyCheck, TbCopyX } from "react-icons/tb";
import { DataTable, type TColumnDef } from "../../../../components/DataTable";
import { useDeleteInvitation } from "../_hook/useDeleteInvitation";
import { useInvitations } from "../_hook/useInvitations";

const columns: TColumnDef<TNamespaceInvitation>[] = [
  {
    id: "token",
    header: "招待",
    cell: ({ row }) => {
      const [copySuccess, setCopySuccess] = useState<boolean | undefined>(
        undefined,
      );
      const onCopy = async () => {
        try {
          const url = `${location.origin}/invitations/${row.original.token}`;
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
        } catch (err) {
          setCopySuccess(false);
        }
      };

      return (
        <div className="flex flex-row items-center">
          <span className="truncate flex-1">{row.original.token}</span>
          <Button variant={"outline"} onClick={onCopy}>
            {copySuccess === undefined ? (
              <TbCopy />
            ) : copySuccess ? (
              <TbCopyCheck color="lightgreen" />
            ) : (
              <TbCopyX color="red" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    id: "expires",
    header: "有効期限",
    cell: ({ row }) => {
      return row.original.expires
        ? new Date(row.original.expires).toLocaleString()
        : "無期限";
    },
    size: 175,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const { deleteNamespaceInvitation, loading } = useDeleteInvitation(
        row.original.namespaceId,
      );

      const onDelete = async () => {
        await deleteNamespaceInvitation(row.original.id);
      };

      return (
        <Button variant={"outline"} onClick={onDelete} disabled={loading}>
          削除
        </Button>
      );
    },
    size: 100,
  },
];

type Props = {
  nsId: TNamespaceId;
};

export const InvitationsList = ({ nsId }: Props) => {
  const { invitations, isPending } = useInvitations(nsId);

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!invitations) {
    return <p>Failed to load invitations</p>;
  }

  return (
    <div>
      <DataTable columns={columns} data={invitations} />
    </div>
  );
};
