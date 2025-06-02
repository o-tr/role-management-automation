import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  TMemberId,
  TMemberWithRelation,
  TNamespaceId,
} from "@/types/prisma";
import { type FC, useMemo, useState } from "react";
import { onMembersChange } from "../_hooks/on-members-change";
import { useCreateMembers } from "../_hooks/use-create-members";
import { EditMember } from "./EditMember/EditMember";

type Props = {
  nsId: TNamespaceId;
};

export const AddMembers: FC<Props> = ({ nsId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createMembers, loading } = useCreateMembers(nsId);
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
    await createMembers([
      {
        tags: member.tags.map((tag) => tag.id),
        services: member.externalAccounts,
      },
    ]);
    onMembersChange();
    setIsModalOpen(false);
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
