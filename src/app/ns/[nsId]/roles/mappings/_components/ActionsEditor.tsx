import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TMappingAction,
  type TMappingActionType,
  ZMappingActions,
  createNewMappingAction,
} from "@/types/actions";
import type { TServiceRoleId } from "@/types/prisma";
import type { Dispatch, FC, SetStateAction } from "react";
import { useServiceAccounts } from "../../_hooks/use-service-accounts";
import { useServiceGroups } from "../../_hooks/use-service-groups";
import { ServiceAccountPicker } from "../../components/ServiceAccountPicker";
import { ServiceGroupPicker } from "../../components/ServiceGroupPicker";
import { ServiceGroupRoleDisplay } from "../../components/ServiceGroupRoleDisplay";
import { useGroupRoles } from "../_hooks/use-group-roles";

type Props = {
  nsId: string;
  actions: TMappingAction[];
  onChange: Dispatch<SetStateAction<TMappingAction[]>>;
};

export const ActionsEditor: FC<Props> = ({ actions, onChange, nsId }) => {
  return (
    <Card className="space-y-1 p-2">
      {actions.map((action) => (
        <div className="flex flex-row items-center gap-2" key={action.id}>
          <ActionsItem
            key={action.id}
            nsId={nsId}
            action={action}
            onChange={(value) =>
              onChange((actions) => {
                const newActions = [...actions];
                newActions[actions.indexOf(action)] = value;
                return newActions;
              })
            }
          />
          <Button
            variant="secondary"
            type="button"
            onClick={() =>
              onChange((actions) => actions.filter((a) => a !== action))
            }
          >
            アクションを削除
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() =>
          onChange((actions) => [...actions, createNewMappingAction("add")])
        }
      >
        アクションを追加
      </Button>
    </Card>
  );
};

const typesLabel: { [key in TMappingActionType]: string } = {
  add: "追加する",
  remove: "削除する",
};

type ActionsItemProps = {
  nsId: string;
  action: TMappingAction;
  onChange: (action: TMappingAction) => void;
};

const ActionsItem: FC<ActionsItemProps> = ({ action, onChange, nsId }) => {
  const { accounts } = useServiceAccounts(nsId);
  const { groups: tmpGroups, isPending: isGroupsPending } =
    useServiceGroups(nsId);
  const groups =
    tmpGroups?.filter((g) => g.account.id === action.targetServiceAccountId) ??
    [];
  const { roles } = useGroupRoles(
    nsId,
    action.targetServiceAccountId,
    action.targetServiceGroupId,
  );
  const selectedRole = roles?.find(
    (role) => role.id === action.targetServiceRoleId,
  );
  return (
    <Card className="flex flex-row gap-2 items-center p-2">
      <FormItem>
        <ServiceAccountPicker
          accounts={accounts ?? []}
          onChange={(value) =>
            onChange({ ...action, targetServiceAccountId: value })
          }
          value={action.targetServiceAccountId}
        />
      </FormItem>
      <FormItem>
        <ServiceGroupPicker
          disabled={isGroupsPending || groups.length === 0}
          groups={groups ?? []}
          onChange={(value) =>
            onChange({ ...action, targetServiceGroupId: value })
          }
          value={action.targetServiceGroupId}
        />
      </FormItem>
      <span>の</span>
      <FormItem>
        <Select
          value={action.targetServiceRoleId}
          disabled={!roles}
          onValueChange={(value) =>
            onChange({
              ...action,
              targetServiceRoleId: value as TServiceRoleId,
            })
          }
        >
          <SelectTrigger>
            <SelectValue>
              {roles?.find((role) => role.id === action.targetServiceRoleId)
                ?.name || "ロール"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {roles?.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                <ServiceGroupRoleDisplay role={role} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
      <span>を</span>
      <FormItem>
        <Select
          value={action.type}
          onValueChange={(value) =>
            onChange({ ...action, type: value as TMappingActionType })
          }
        >
          <SelectTrigger>
            <SelectValue>{typesLabel[action.type]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ZMappingActions.map((type) => (
              <SelectItem key={type} value={type}>
                {typesLabel[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    </Card>
  );
};
