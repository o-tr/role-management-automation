import type { Dispatch, FC, SetStateAction } from "react";
import type { TMemberWithRelation } from "@/types/prisma";
import { TagDisplay } from "../../../components/TagDisplay";
import { AddTag } from "./AddTag";

type Props = {
  member: TMemberWithRelation;
  setMember: Dispatch<SetStateAction<TMemberWithRelation>>;
  disabled?: boolean;
};
export const EditTags: FC<Props> = ({ member, setMember, disabled }) => {
  return (
    <div>
      {member.tags.map((tag) => (
        <TagDisplay
          key={tag.id}
          tag={tag}
          onDelete={(tag) => {
            setMember((pv) => {
              const nv = structuredClone(pv);
              nv.tags = nv.tags.filter((t) => t.id !== tag.id);
              return nv;
            });
          }}
        />
      ))}
      <AddTag
        member={member}
        onConfirm={(tag) => {
          setMember((pv) => {
            const nv = structuredClone(pv);
            nv.tags.push({
              ...tag,
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
