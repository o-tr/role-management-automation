import { Card } from "@/components/ui/card";
import type { TMember } from "@/types/prisma";
import { type FC, useState } from "react";
import { EditExternalAccounts } from "./EditExternalAccounts";

type Props = {
  member: TMember;
};

export const EditMember: FC<Props> = ({ member: original }) => {
  const [member, setMember] = useState(original);

  return (
    <div>
      <Card className="p-4">
        <span>外部サービス連携</span>
        <EditExternalAccounts member={member} setMember={setMember} />
      </Card>
    </div>
  );
};
