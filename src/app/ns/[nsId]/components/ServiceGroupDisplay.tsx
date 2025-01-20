import type { TAvailableGroup } from "@/types/prisma";
import type { FC } from "react";

type Props = {
  group: TAvailableGroup;
};

export const ServiceGroupDisplay: FC<Props> = ({ group }) => {
  return (
    <div className="flex flex-row items-center">
      {group.icon && (
        <img
          src={group.icon}
          alt={group.name}
          className="w-6 h-6 mr-2 rounded-full"
        />
      )}
      <span className="truncate">{group.name}</span>
    </div>
  );
};
