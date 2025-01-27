import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TMemberWithRelation } from "@/types/prisma";
import { type Dispatch, type FC, type SetStateAction, useState } from "react";
import { TbTrash } from "react-icons/tb";
import { useTags } from "../../../roles/_hooks/use-tags";

type Props = {
  member: TMemberWithRelation;
  setMember: Dispatch<SetStateAction<TMemberWithRelation>>;
  disabled: boolean;
};
export const EditTags: FC<Props> = ({ member, setMember, disabled }) => {
  return (
    <div>
      {member.tags.map((tag) => (
        <div key={tag.id}>
          <span>{tag.name}</span>
          <Button
            onClick={() => {
              setMember((pv) => {
                const nv = structuredClone(pv);
                nv.tags = nv.tags.filter((t) => t.id !== tag.id);
                return nv;
              });
            }}
            variant="outline"
            disabled={disabled}
          >
            <TbTrash />
          </Button>
        </div>
      ))}
      <AddTag
        member={member}
        onConfirm={(tag) => {
          setMember((pv) => {
            const nv = structuredClone(pv);
            nv.tags.push({
              id: tag.id,
              name: tag.name,
              namespaceId: member.namespaceId,
            });
            return nv;
          });
        }}
        disabled={disabled}
      />
    </div>
  );
};

const AddTag: FC<{
  member: TMemberWithRelation;
  onConfirm: (tag: { id: string; name: string }) => void;
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
