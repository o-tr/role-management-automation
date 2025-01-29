import { ServiceGroupDisplay } from "@/app/ns/[nsId]/components/ServiceGroupDisplay";
import { ServiceGroupRoleDisplay } from "@/app/ns/[nsId]/components/ServiceGroupRoleDisplay";
import type { TDiffItem } from "@/types/diff";
import type { FC } from "react";
import { TbCheck, TbX } from "react-icons/tb";
import { useGroupRoles } from "../../../_hooks/use-group-roles";

type Props = {
  item: TDiffItem & { success?: boolean; reason?: string };
};

export const DIffItemDisplay: FC<Props> = ({ item }) => {
  const { roles } = useGroupRoles(
    item.serviceGroup.namespaceId,
    item.serviceGroup.account.id,
    item.serviceGroup.id,
  );
  const textColor = (() => {
    if (item.success === undefined) {
      if (item.ignore) return "text-gray-500";
      return "";
    }
    if (item.success) return "text-green-500";
    return "text-red-500";
  })();

  const role = roles?.find((role) => role.id === item.roleId);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex flex-row gap-2 overflow-hidden w-full flex-wrap ${textColor} items-center`}
      >
        {item.success !== undefined && (item.success ? <TbCheck /> : <TbX />)}
        <ServiceGroupDisplay group={item.serviceGroup} />
        <div>{item.type}</div>
        <div>
          {role ? (
            <ServiceGroupRoleDisplay role={role} />
          ) : (
            <div>ロールが見つかりません</div>
          )}
        </div>
      </div>
      {item.reason && (
        <div className="text-sm text-gray-500">{item.reason}</div>
      )}
    </div>
  );
};
