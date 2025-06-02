import { Image } from "@/app/ns/[nsId]/components/Image";
import type { TMemberExternalServiceAccount } from "@/types/prisma";
import type { FC } from "react";
import { useCallback, useState } from "react";

type Props = {
  data: TMemberExternalServiceAccount;
  enableIconRefresh?: boolean;
};

export const MemberExternalAccountDisplay: FC<Props> = ({
  data,
  enableIconRefresh = true,
}) => {
  const [currentIcon, setCurrentIcon] = useState(data.icon);

  const handleIconRefresh = useCallback(async (): Promise<
    string | undefined
  > => {
    console.log("Refreshing icon for", data);
    if (!data.namespaceId || !enableIconRefresh) return undefined;

    try {
      const response = await fetch(
        `/api/ns/${data.namespaceId}/members/external-accounts/${data.id}/refresh-icon`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.status === "success" && result.icon) {
        setCurrentIcon(result.icon);
        return result.icon;
      }
    } catch (error) {
      console.error("Failed to refresh icon:", error);
    }

    return undefined;
  }, [data, enableIconRefresh]);

  const isDeleted = data.status === "DELETED";

  return (
    <div
      className={`flex flex-row items-center ${isDeleted ? "opacity-50" : ""}`}
    >
      {currentIcon && !isDeleted && (
        <Image
          src={currentIcon}
          key={currentIcon}
          alt={data.name}
          className="w-6 h-6 mr-2 rounded-full"
          referrerPolicy="no-referrer"
          width={24}
          height={24}
          onError={handleIconRefresh}
        />
      )}
      {isDeleted && (
        <div className="w-6 h-6 mr-2 bg-red-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-gray-600">✕</span>
        </div>
      )}
      <span
        className={`truncate ${isDeleted ? "line-through text-red-500" : ""}`}
      >
        {data.name}
        {isDeleted && <span className="ml-1 text-xs">(削除済み)</span>}
      </span>
    </div>
  );
};
