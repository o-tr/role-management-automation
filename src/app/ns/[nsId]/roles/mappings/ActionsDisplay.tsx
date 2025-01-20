import { Card } from "@/components/ui/card";
import type { TMappingAction } from "@/types/actions";
import type { FC } from "react";
import { ServiceAccountDisplay } from "../../components/ServiceAccountDisplay";
import { ServiceGroupDisplay } from "../../components/ServiceGroupDisplay";
import { useServiceAccounts } from "../../settings/services/_hooks/use-service-accounts";
import { useServiceGroups } from "../../settings/services/_hooks/use-service-groups";
import { useGroupRoles } from "../_hooks/use-group-roles";

type Props = {
  actions: TMappingAction[];
  nsId: string;
};

export const ActionsDisplay: FC<Props> = ({ actions, nsId }) => {
  return (
    <div>
      {actions.map((action, i) => (
        <ActionDisplay key={action.id} action={action} nsId={nsId} />
      ))}
    </div>
  );
};

type ActionDisplayProps = {
  action: TMappingAction;
  nsId: string;
};

const ActionDisplay: FC<ActionDisplayProps> = ({ action, nsId }) => {
  const { groups } = useServiceGroups(nsId);
  const { accounts } = useServiceAccounts(nsId);
  const { roles } = useGroupRoles(
    nsId,
    action.targetServiceAccountId,
    action.targetServiceGroupId,
  );

  const group = groups?.find((g) => g.id === action.targetServiceGroupId);
  const account = accounts?.find((a) => a.id === action.targetServiceAccountId);
  const role = roles?.find((r) => r.id === action.targetServiceRoleId);
  console.log("ActionDisplay", roles, role);

  return (
    <Card className="p-2 flex flex-row items-center space-x-2">
      {account && <ServiceAccountDisplay account={account} />}
      {group && <ServiceGroupDisplay group={group} />}の
      {role && <span>{role.name}</span>}
      {action.type === "add" && <span>追加</span>}
      {action.type === "remove" && <span>削除</span>}
    </Card>
  );
};
