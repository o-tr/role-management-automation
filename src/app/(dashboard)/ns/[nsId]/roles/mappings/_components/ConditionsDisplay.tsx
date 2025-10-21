import type { FC } from "react";
import { Card } from "@/components/ui/card";
import type { TMappingCondition } from "@/types/conditions";
import type { TTagId } from "@/types/prisma";
import { TagDisplay } from "../../../components/TagDisplay";
import { useTags } from "../../_hooks/use-tags";
import { comparatorsLabel, keysLabel } from "./labels";

type Props = {
  conditions: TMappingCondition;
  nsId: string;
};

export const ConditionsDisplay: FC<Props> = ({ conditions, nsId }) => {
  const { tags, isPending } = useTags(nsId);
  if (conditions.type === "comparator") {
    const isArrayValue = Array.isArray(conditions.value);

    // ローディング状態を先頭で処理
    if (isPending) {
      return (
        <Card className="p-2 gap-1 flex flex-row items-center flex-wrap">
          <span>{keysLabel[conditions.key]}</span>
          <span>loading...</span>
          <span>{comparatorsLabel[conditions.comparator]}</span>
        </Card>
      );
    }

    if (isArrayValue) {
      const valueArray = conditions.value as string[];
      const selectedTags = tags?.filter((t) => valueArray.includes(t.id)) || [];
      const tagIdSet = new Set(tags?.map((t) => t.id) || []);
      const missingTags = valueArray.filter(
        (id: string) => !tagIdSet.has(id as TTagId),
      );

      return (
        <Card className="p-2 gap-1 flex flex-row items-center flex-wrap">
          <span>{keysLabel[conditions.key]}</span>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <TagDisplay key={tag.id} tag={tag} display="inline" />
            ))}
            {missingTags.length > 0 && (
              <span className="text-red-600">
                [削除されたタグ: {missingTags.length}個]
              </span>
            )}
          </div>
          <span>{comparatorsLabel[conditions.comparator]}</span>
        </Card>
      );
    } else {
      const tag = tags?.find((t) => t.id === conditions.value);

      return (
        <Card className="p-2 gap-1 flex flex-row items-center flex-wrap">
          <span>{keysLabel[conditions.key]}</span>
          {tag ? (
            <TagDisplay tag={tag} display="inline" />
          ) : (
            <span className="text-red-600">[削除されたタグ]</span>
          )}
          <span>{comparatorsLabel[conditions.comparator]}</span>
        </Card>
      );
    }
  }
  if (conditions.type === "and") {
    return (
      <Card className="p-2 space-y-2">
        <span>次の条件すべてが満たされる</span>
        <div className="pl-2 space-y-2">
          {conditions.conditions.map((c) => (
            <ConditionsDisplay key={c.id} conditions={c} nsId={nsId} />
          ))}
        </div>
      </Card>
    );
  }
  if (conditions.type === "or") {
    return (
      <Card className="p-2 space-y-2">
        <span>次の条件のいずれかが満たされる</span>
        <div className="pl-2 space-y-2">
          {conditions.conditions.map((c) => (
            <ConditionsDisplay key={c.id} conditions={c} nsId={nsId} />
          ))}
        </div>
      </Card>
    );
  }
  if (conditions.type === "not") {
    return (
      <Card className="p-2 space-y-2">
        <span>次の条件が満たされない</span>
        <div className="pl-2">
          <ConditionsDisplay conditions={conditions.condition} nsId={nsId} />
        </div>
      </Card>
    );
  }
};
