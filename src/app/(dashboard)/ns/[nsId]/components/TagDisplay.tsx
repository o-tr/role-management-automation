import type { TTag } from "@/types/prisma";
import type { FC } from "react";
import { TbTagFilled, TbX } from "react-icons/tb";

type Props = {
  tag: TTag;
  display?: "inline" | "block";
  variant?: "ghost" | "outline";
  onDelete?: (tag: TTag) => void;
  deleteArea?: "button" | "all";
};

export const TagDisplay: FC<Props> = ({
  tag,
  display,
  variant,
  onDelete,
  deleteArea: _deleteArea,
}) => {
  const displayCss = display === "block" ? "flex" : "inline-flex";
  const variantCss =
    variant === "outline" ? "border rounded-md px-2 h-[22px] py-1" : "";
  const deleteArea = _deleteArea || "button";

  if (deleteArea === "all") {
    return (
      <button
        className={`${displayCss} items-center gap-1 ${variantCss}`}
        type="button"
        onClick={() => onDelete?.(tag)}
      >
        <TbTagFilled style={{ color: tag.color }} />
        <span>{tag.name}</span>
        {onDelete && (
          <button
            className="bg-red-400 rounded-full w-3 h-3 grid place-items-center"
            type="button"
            onClick={() => onDelete(tag)}
          >
            <TbX size={"8px"} />
          </button>
        )}
      </button>
    );
  }

  return (
    <div className={`${displayCss} items-center gap-1 ${variantCss}`}>
      <div className="relative group">
        <TbTagFilled style={{ color: tag.color }} />
        {onDelete && (
          <button
            className="group-hover:grid hidden absolute left-0 top-0 bg-red-400 rounded-full w-full h-full place-items-center"
            type="button"
            onClick={() => deleteArea === "button" && onDelete(tag)}
          >
            <TbX size={"12px"} />
          </button>
        )}
      </div>
      <span>{tag.name}</span>
    </div>
  );
};
