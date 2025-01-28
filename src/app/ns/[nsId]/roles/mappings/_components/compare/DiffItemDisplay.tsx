import { ServiceGroupDisplay } from "@/app/ns/[nsId]/components/ServiceGroupDisplay";
import type { TDiffItem } from "@/types/diff";
import type { FC } from "react";
import { TbCheck, TbX } from "react-icons/tb";
import { useGroupRoles } from "../../../_hooks/use-group-roles";

type Props = {
  item: TDiffItem & { success?: boolean };
};

export const DIffItemDisplay: FC<Props> = ({ item }) => {
  const { roles } = useGroupRoles(
    item.serviceGroup.namespaceId,
    item.serviceGroup.account.id,
    item.serviceGroup.id,
  );
  const textColor =
    item.success === undefined
      ? ""
      : item.success
        ? "text-green-500"
        : "text-red-500";

  return (
    <div
      className={`flex flex-row gap-2 overflow-hidden w-full flex-wrap ${textColor} items-center`}
    >
      {item.success !== undefined && (item.success ? <TbCheck /> : <TbX />)}
      <ServiceGroupDisplay group={item.serviceGroup} />
      <div>{item.type}</div>
      <div>
        {roles?.find((role) => role.id === item.roleId)?.name || item.roleId}
      </div>
    </div>
  );
};
