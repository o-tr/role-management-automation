import { Button } from "@/components/ui/button";
import type { TMember } from "@/types/prisma";
import type { Dispatch, FC, SetStateAction } from "react";
import { TbTrash } from "react-icons/tb";
import { MemberExternalAccountDisplay } from "../../../components/MemberExternalAccountDisplay";
import { AddExternalAccount } from "./AddExternalAccount";

type Props = {
  member: TMember;
  setMember: Dispatch<SetStateAction<TMember>>;
  disabled: boolean;
};

export const EditExternalAccounts: FC<Props> = ({
  member,
  setMember,
  disabled,
}) => {
  return (
    <div>
      {member.externalAccounts.map((account) => (
        <div key={account.id} className="flex flex-row items-center gap-2">
          <span>{account.service}:</span>
          <MemberExternalAccountDisplay data={account} />
          <Button
            variant={"outline"}
            size={"sm"}
            disabled={member.externalAccounts.length === 1 || disabled}
            onClick={() => {
              setMember((pv) => {
                const nv = structuredClone(pv);
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
      <AddExternalAccount
        member={member}
        setMember={setMember}
        disabled={disabled}
      />
    </div>
  );
};
