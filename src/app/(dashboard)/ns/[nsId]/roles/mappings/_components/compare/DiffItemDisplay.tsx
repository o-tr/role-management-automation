import { ServiceGroupDisplay } from "@/app/(dashboard)/ns/[nsId]/components/ServiceGroupDisplay";
import { ServiceGroupRoleDisplay } from "@/app/(dashboard)/ns/[nsId]/components/ServiceGroupRoleDisplay";
import type {
  ApplyDiffResultItem,
  ApplyDiffResultStatus,
} from "@/app/api/ns/[nsId]/mappings/apply/applyDiffWithProgress";
import type { TDiffItem } from "@/types/diff";
import type { FC } from "react";
import { TbCheck, TbMinus, TbX } from "react-icons/tb";
import { useGroupRoles } from "../../../_hooks/use-group-roles";

const statusMap = {
  error: {
    color: "text-red-500",
    icon: <TbX />,
  },
  success: {
    color: "text-green-500",
    icon: <TbCheck />,
  },
  skipped: {
    color: "text-gray-500",
    icon: <TbMinus />,
  },
} as Record<ApplyDiffResultStatus, { color: string; icon: JSX.Element }>;

type Props = {
  item: ApplyDiffResultItem | TDiffItem;
};

export const DIffItemDisplay: FC<Props> = ({ item }) => {
  const { roles } = useGroupRoles(
    item.serviceGroup.namespaceId,
    item.serviceGroup.account.id,
    item.serviceGroup.id,
  );
  const textColor = (() => {
    if (!("status" in item)) {
      if (item.ignore) return "text-gray-500";
      return "";
    }
    return statusMap[item.status].color;
  })();

  const role = roles?.find((role) => role.id === item.roleId);

  return (
    <div className={`flex flex-row gap-1 ${textColor}`}>
      {("status" in item && (
        <div className="h-[24px] w-[24px] grid place-items-center">
          {statusMap[item.status].icon}
        </div>
      )) ||
        null}

      <div className="flex flex-col gap-1">
        <div
          className={
            "flex flex-row gap-2 overflow-hidden w-full flex-wrap items-center"
          }
        >
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
        {"reason" in item && (
          <div className="text-sm text-gray-500">{item.reason}</div>
        )}
      </div>
    </div>
  );
};
