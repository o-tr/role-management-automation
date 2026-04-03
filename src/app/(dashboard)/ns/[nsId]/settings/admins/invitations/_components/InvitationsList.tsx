import { redirect } from "next/navigation";
import { type FC, useCallback, useMemo, useState } from "react";
import { TbCopy, TbCopyCheck, TbCopyX } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { TNamespaceId, TNamespaceInvitation } from "@/types/prisma";
import { DataTable, type TColumnDef } from "../../../../components/DataTable";
import { useDeleteInvitation } from "../_hook/useDeleteInvitation";
import { useInvitations } from "../_hook/useInvitations";

const TokenCell: FC<{
  invitation: TNamespaceInvitation;
  disabled: boolean;
}> = ({ invitation, disabled }) => {
  const [copySuccess, setCopySuccess] = useState<boolean | undefined>(
    undefined,
  );
  const onCopy = async () => {
    if (disabled) return;
    try {
      const url = `${location.origin}/invitations/${invitation.token}`;
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
    } catch (_err) {
      setCopySuccess(false);
    }
  };

  return (
    <div className="flex flex-row items-center">
      <span className="truncate flex-1">{invitation.token}</span>
      <Button variant={"outline"} onClick={onCopy} disabled={disabled}>
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
};

type Props = {
  nsId: TNamespaceId;
};

export const InvitationsList: FC<Props> = ({ nsId }) => {
  const { invitations, isPending, responseError, mutateInvitations } =
    useInvitations(nsId);
  const { deleteNamespaceInvitation, loading } = useDeleteInvitation(nsId);
  const { toast } = useToast();
  const [pendingInvitationIds, setPendingInvitationIds] = useState<Set<string>>(
    () => new Set(),
  );

  const deleteInvitation = useCallback(
    async (invitationId: string) => {
      setPendingInvitationIds((prev) => new Set(prev).add(invitationId));
      try {
        await deleteNamespaceInvitation(
          invitationId as TNamespaceInvitation["id"],
        );
        await mutateInvitations((current) => {
          if (!current || current.status !== "success") return current;
          return {
            ...current,
            invitations: current.invitations.filter(
              (invitation) => invitation.id !== invitationId,
            ),
          };
        }, false);
      } catch (error) {
        toast({
          title: "招待削除に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
      } finally {
        setPendingInvitationIds((prev) => {
          const next = new Set(prev);
          next.delete(invitationId);
          return next;
        });
      }
    },
    [deleteNamespaceInvitation, mutateInvitations, toast],
  );

  const columns = useMemo<TColumnDef<TNamespaceInvitation>[]>(
    () => [
      {
        id: "token",
        header: "招待",
        cell: ({ row }) => {
          const disabled = loading || pendingInvitationIds.has(row.original.id);
          return <TokenCell invitation={row.original} disabled={disabled} />;
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
          const disabled = loading || pendingInvitationIds.has(row.original.id);
          return (
            <Button
              variant={"outline"}
              onClick={() => {
                void deleteInvitation(row.original.id);
              }}
              disabled={disabled}
            >
              削除
            </Button>
          );
        },
        size: 100,
      },
    ],
    [deleteInvitation, loading, pendingInvitationIds],
  );

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (responseError) {
    if (responseError.code === 401) {
      redirect("/");
      return null;
    }
    if (responseError.code === 404) {
      redirect("/ns");
      return null;
    }
    if (responseError.code === 403) {
      redirect(`/ns/${nsId}/`);
      return null;
    }
    return <p>エラーが発生しました</p>;
  }

  if (!invitations) {
    return <p>招待がありません</p>;
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={invitations}
        getRowId={(row) => row.id}
      />
    </div>
  );
};
