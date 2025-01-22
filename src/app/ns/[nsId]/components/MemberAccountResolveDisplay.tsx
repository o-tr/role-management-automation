import type { TResolveRequestType } from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import type { FC } from "react";
import { useMemberResolve } from "../_hooks/use-member-resolve";

type Props = {
  nsId: string;
  type: TResolveRequestType;
  serviceId: string;
};

export const MemberAccountResolveDisplay: FC<Props> = ({
  nsId,
  type,
  serviceId,
}) => {
  const { data, isLoading } = useMemberResolve(nsId, type, serviceId);
  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (data?.status !== "success")
    return <div className="text-red-500">Not Found ({serviceId})</div>;
  return (
    <div className="flex flex-row items-center">
      {data.item.icon && (
        <img
          src={data.item.icon}
          alt={data.item.name}
          className="w-6 h-6 mr-2 rounded-full"
        />
      )}
      <span className="truncate">{data.item.name}</span>
    </div>
  );
};
