import { ServiceGroupDisplay } from "@/app/ns/[nsId]/components/ServiceGroupDisplay";
import type { FC } from "react";
import { useGroupRoles } from "../../../_hooks/use-group-roles";
import type { TDiffItem } from "./_hooks/useCompare";

type Props = {
  item: TDiffItem;
};

export const DIffItemDisplay: FC<Props> = ({ item }) => {
  const { roles } = useGroupRoles(
    item.serviceGroup.namespaceId,
    item.serviceGroup.account.id,
    item.serviceGroup.id,
  );
  return (
    <div className="flex flex-row gap-2 overflow-hidden w-full flex-wrap">
      <ServiceGroupDisplay group={item.serviceGroup} />
      <div>{item.type}</div>
      <div>
        {roles?.find((role) => role.id === item.roleId)?.name || item.roleId}
      </div>
    </div>
  );
};
