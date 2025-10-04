import { type FC, useLayoutEffect } from "react";
import { Image } from "@/app/(dashboard)/ns/[nsId]/components/Image";
import type {
  ResolveResult,
  TResolveRequestType,
} from "@/app/api/ns/[nsId]/members/resolve/[type]/[serviceId]/route";
import { useMemberResolve } from "../_hooks/use-member-resolve";

type Props = {
  nsId: string;
  type: TResolveRequestType;
  serviceId: string;
  onResolve?: (data: ResolveResult) => void;
};

export const MemberAccountResolveDisplay: FC<Props> = ({
  nsId,
  type,
  serviceId,
  onResolve,
}) => {
  const { data, isLoading } = useMemberResolve(nsId, type, serviceId);

  useLayoutEffect(() => {
    if (data?.status !== "success") return;
    onResolve?.(data.item);
  }, [data, onResolve]);

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (data?.status !== "success")
    return <div className="text-red-500">Not Found ({serviceId})</div>;
  return (
    <div
      className={`flex flex-row items-center ${
        data.item.memberId ? "text-green-500" : ""
      }`}
    >
      {data.item.icon && (
        <Image
          src={data.item.icon}
          alt={data.item.name ?? ""}
          className="w-6 h-6 mr-2 rounded-full"
          referrerPolicy="no-referrer"
          width={24}
          height={24}
        />
      )}
      <span className="truncate">{data.item.name}</span>
    </div>
  );
};
