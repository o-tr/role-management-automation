import type { TServiceAccount } from "@/types/prisma";
import type { FC } from "react";

type Props = {
  account: TServiceAccount;
};

export const ServiceAccountDisplay: FC<Props> = ({ account }) => {
  return (
    <div className="flex flex-row items-center">
      {account.icon && (
        <img
          src={account.icon}
          alt={account.name}
          className="w-6 h-6 mr-2 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="truncate">{`${account.name} (${account.service})`}</span>
    </div>
  );
};
