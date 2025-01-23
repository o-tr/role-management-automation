import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TMember } from "@/types/prisma";
import { type FC, useEffect, useState } from "react";
import { TbTrash } from "react-icons/tb";
import { MemberExternalAccountDisplay } from "../../components/MemberExternalAccountDisplay";

type Props = {
  member: TMember;
};

export const EditMember: FC<Props> = ({ member: original }) => {
  const [member, setMember] = useState(original);
  useEffect(() => {
    setMember(original);
  }, [original]);
  return (
    <div>
      <Card className="p-4">
        <span>外部サービス連携</span>
        {member.externalAccounts.map((account) => (
          <div key={account.id} className="flex flex-row items-center gap-2">
            <span>{account.service}:</span>
            <MemberExternalAccountDisplay data={account} />
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => {
                setMember((pv) => {
                  const nv = { ...pv };
                  nv.externalAccounts = nv.externalAccounts.filter(
                    (a) => a.id !== account.id,
                  );
                  return nv;
                });
              }}
            >
              <TbTrash />
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
};
