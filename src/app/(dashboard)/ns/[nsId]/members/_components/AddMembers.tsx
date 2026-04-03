import { type FC, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import type {
  TMemberId,
  TMemberWithRelation,
  TNamespaceId,
} from "@/types/prisma";
import { onMembersChange } from "../_hooks/on-members-change";
import { useCreateMembers } from "../_hooks/use-create-members";
import { EditMember } from "./EditMember/EditMember";

type Props = {
  nsId: TNamespaceId;
};

export const AddMembers: FC<Props> = ({ nsId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createMembers, loading } = useCreateMembers(nsId);
  const { toast } = useToast();
  const defaultMember: TMemberWithRelation = useMemo<TMemberWithRelation>(
    () => ({
      id: "" as TMemberId,
      namespaceId: nsId,
      externalAccounts: [],
      tags: [],
    }),
    [nsId],
  );

  const onConfirm = async (member: TMemberWithRelation) => {
    try {
      await createMembers([
        {
          tags: member.tags.map((tag) => tag.id),
          services: member.externalAccounts,
        },
      ]);
      onMembersChange();
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "メンバー追加に失敗しました",
        description:
          error instanceof Error
            ? error.message
            : "しばらくしてから再度お試しください。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>メンバーを追加</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>メンバーを追加</DialogHeader>
        <EditMember
          member={defaultMember}
          onConfirm={onConfirm}
          disabled={loading}
          type="add"
        />
      </DialogContent>
    </Dialog>
  );
};
