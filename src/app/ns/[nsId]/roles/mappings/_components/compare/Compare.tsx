import type { TNamespaceId } from "@/types/prisma";
import type { FC } from "react";
import { useCompare } from "./_hooks/useCompare";

type Props = {
  nsId: TNamespaceId;
};

export const Compare: FC<Props> = ({ nsId }) => {
  const { isPending, diff } = useCompare(nsId);
  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {diff.map((member) => (
        <div key={member.member.id} className="flex flex-row gap-2">
          <div>{member.member.externalAccounts[0].name}</div>
          <div className="flex flex-col gap-2">
            {member.diff.map((diff) => {
              return (
                <div
                  key={diff.groupMember.serviceId}
                  className="flex flex-row gap-2"
                >
                  <div>{diff.serviceAccount.name}</div>
                  <div>{diff.type}</div>
                  <div>{diff.roleId}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
