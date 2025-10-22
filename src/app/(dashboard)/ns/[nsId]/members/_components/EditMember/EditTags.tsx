import type { Dispatch, FC, SetStateAction } from "react";
import type { TMemberWithRelation, TTagId } from "@/types/prisma";
import { MultipleTagPicker } from "../../../components/MultipleTagPicker";
import { useTags } from "../../../roles/_hooks/use-tags";

type Props = {
  member: TMemberWithRelation;
  setMember: Dispatch<SetStateAction<TMemberWithRelation>>;
};
export const EditTags: FC<Props> = ({ member, setMember }) => {
  const { tags } = useTags(member.namespaceId);

  // 現在選択されているタグIDを抽出
  const selectedTagIds = member.tags.map((tag) => tag.id);

  const handleTagChange = (newTagIds: TTagId[]) => {
    setMember((prev) => {
      const nv = structuredClone(prev);
      // 新しいタグIDから完全なタグオブジェクトを復元
      nv.tags = newTagIds
        .map((tagId) => tags?.find((tag) => tag.id === tagId))
        .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);
      return nv;
    });
  };

  return (
    <div>
      <MultipleTagPicker
        tags={tags || []}
        selectedTags={selectedTagIds}
        onChange={(value) => {
          const next =
            typeof value === "function" ? value(selectedTagIds) : value;
          handleTagChange(next);
        }}
        showSelectAll
      />
    </div>
  );
};
