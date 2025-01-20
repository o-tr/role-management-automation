import type { TExternalServiceGroupRole } from "@/types/prisma";
import type { FC } from "react";

type Props = {
  role: TExternalServiceGroupRole;
};

export const ServiceGroupRoleDisplay: FC<Props> = ({ role }) => {
  return (
    <span
      style={{
        color: role.color,
      }}
    >
      {role.name}
    </span>
  );
};
