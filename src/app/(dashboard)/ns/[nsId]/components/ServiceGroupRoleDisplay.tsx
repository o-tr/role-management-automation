import type { FC } from "react";
import { TbTagsFilled } from "react-icons/tb";
import type { TExternalServiceGroupRole } from "@/types/prisma";

type Props = {
  role: TExternalServiceGroupRole;
  display?: "inline" | "block";
  variant?: "ghost" | "outline";
};

export const ServiceGroupRoleDisplay: FC<Props> = ({
  role,
  display,
  variant,
}) => {
  const displayCss = display === "block" ? "flex" : "inline-flex";
  const variantCss =
    variant === "outline" ? "border rounded-md px-2 h-[22px]" : "";
  return (
    <div className={`${displayCss} items-center gap-1 ${variantCss}`}>
      <div className="relative group">
        <TbTagsFilled style={{ color: role.color }} />
      </div>
      <span>{role.name}</span>
    </div>
  );
};
