import { Image } from "@/app/ns/[nsId]/components/Image";
import type { TAvailableGroup } from "@/types/prisma";
import type { FC } from "react";

type Props = {
  group: TAvailableGroup;
};

export const ServiceGroupDisplay: FC<Props> = ({ group }) => {
  return (
    <div className="flex flex-row items-center">
      {group.icon && (
        <Image
          src={group.icon}
          alt={group.name}
          width={24}
          height={24}
          className="w-6 h-6 mr-2 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="truncate">{group.name}</span>
    </div>
  );
};
