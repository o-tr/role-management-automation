import { Image } from "@/app/ns/[nsId]/components/Image";
import type { TMemberExternalServiceAccount } from "@/types/prisma";
import type { FC } from "react";

type Props = {
  data: TMemberExternalServiceAccount;
};

export const MemberExternalAccountDisplay: FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-row items-center">
      {data.icon && (
        <Image
          src={data.icon}
          alt={data.name}
          className="w-6 h-6 mr-2 rounded-full"
          referrerPolicy="no-referrer"
          width={24}
          height={24}
        />
      )}
      <span className="truncate">{data.name}</span>
    </div>
  );
};
