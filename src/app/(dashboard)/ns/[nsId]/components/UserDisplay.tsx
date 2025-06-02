import { Image } from "@/app/(dashboard)/ns/[nsId]/components/Image";
import type { FUser } from "@/types/prisma";
import type { FC } from "react";

type Props = {
  account: FUser;
};

export const UserDisplay: FC<Props> = ({ account }) => {
  return (
    <div className="flex flex-row items-center">
      {account.icon && (
        <Image
          src={account.icon}
          alt={account.name || ""}
          width={24}
          height={24}
          className="w-6 h-6 mr-2 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="truncate">{account.name}</span>
    </div>
  );
};
