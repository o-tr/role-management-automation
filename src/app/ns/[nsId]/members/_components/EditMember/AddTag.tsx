import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TMemberWithRelation, TTagId } from "@/types/prisma";
import { type FC, useState } from "react";
import { useTags } from "../../../roles/_hooks/use-tags";

export const AddTag: FC<{
  member: TMemberWithRelation;
  onConfirm: (tag: { id: TTagId; name: string }) => void;
  disabled: boolean;
}> = ({ onConfirm, member, disabled }) => {
  const { tags } = useTags(member.namespaceId);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(
    undefined,
  );
  console.log(tags, selectedTagId);

  return (
    <div className="flex flex-row items-center justify-center">
      <Select
        disabled={!tags || disabled}
        value={selectedTagId}
        onValueChange={setSelectedTagId}
        key={selectedTagId}
      >
        <SelectTrigger>
          <SelectValue placeholder="タグを選択" />
        </SelectTrigger>
        <SelectContent>
          {tags
            ?.filter((tag) => !member.tags.some((item) => item.id === tag.id))
            .map((tag) => (
              <SelectItem
                key={tag.id}
                onClick={() => setSelectedTagId(tag.id)}
                value={tag.id}
              >
                {tag.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <Button
        onClick={() => {
          const tag = tags?.find((t) => t.id === selectedTagId);
          if (tag) {
            onConfirm(tag);
            setSelectedTagId(undefined);
          }
        }}
        disabled={!selectedTagId || disabled}
      >
        追加
      </Button>
    </div>
  );
};
