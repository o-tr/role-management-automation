import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TTag } from "@/types/prisma";
import type { FC } from "react";
import { TbTag, TbTagFilled, TbX } from "react-icons/tb";

type Props = {
  tag: TTag;
  display?: "inline" | "block";
  variant?: "ghost" | "outline";
  onDelete?: (tag: TTag) => void;
};

export const TagDisplay: FC<Props> = ({ tag, display, variant, onDelete }) => {
  const displayCss = display === "block" ? "flex" : "inline-flex";
  const variantCss =
    variant === "outline" ? "border rounded-md px-2 h-[22px]" : "";
  return (
    <div className={`${displayCss} items-center gap-1 ${variantCss}`}>
      <div className="relative group">
        <TbTagFilled style={{ color: tag.color }} />
        {onDelete && (
          <button
            className="group-hover:grid hidden absolute left-0 top-0 bg-red-400 rounded-full w-full h-full place-items-center"
            type="button"
          >
            <TbX onClick={() => onDelete(tag)} size={"12px"} />
          </button>
        )}
      </div>
      <span>{tag.name}</span>
    </div>
  );
};
