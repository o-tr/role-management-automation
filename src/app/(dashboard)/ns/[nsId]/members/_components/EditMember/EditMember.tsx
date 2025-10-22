import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TMemberWithRelation } from "@/types/prisma";
import { EditExternalAccounts } from "./EditExternalAccounts";
import { EditTags } from "./EditTags";

type Props = {
  member: TMemberWithRelation;
  onConfirm: (member: TMemberWithRelation) => void;
  disabled?: boolean;
  type?: "add" | "edit";
};

export const EditMember: FC<Props> = ({
  member: original,
  onConfirm,
  disabled,
  type,
}) => {
  const [member, setMember] = useState(original);

  const onConfirmClick = () => {
    onConfirm(member);
  };

  return (
    <div>
      <Card className="p-4">
        <span>外部サービス連携</span>
        <EditExternalAccounts
          member={member}
          setMember={setMember}
          disabled={disabled}
        />
      </Card>
      <Card className="p-4">
        <span>タグ</span>
        <EditTags member={member} setMember={setMember} />
      </Card>
      <Button onClick={onConfirmClick} disabled={disabled}>
        {type === "add" ? "追加" : "更新"}
      </Button>
    </div>
  );
};
