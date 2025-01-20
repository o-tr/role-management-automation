import { Card } from "@/components/ui/card";
import type {
  TMappingComparator,
  TMappingCondition,
  TMappingKey,
} from "@/types/conditions";
import type { FC } from "react";
import { useTags } from "../_hooks/use-tags";

type Props = {
  conditions: TMappingCondition;
  nsId: string;
};

const keysLabel: { [key in TMappingKey]: string } = {
  "some-tag": "タグ",
};

const comparatorsLabel: { [key in TMappingComparator]: string } = {
  equals: "含む",
  notEquals: "含まない",
};

export const ConditionsDisplay: FC<Props> = ({ conditions, nsId }) => {
  const { tags } = useTags(nsId);
  if (conditions.type === "comparator") {
    const tag = tags?.find((t) => t.id === conditions.value);

    return (
      <Card className="p-2">
        <span>{keysLabel[conditions.key]}</span>
        {tag ? (
          <span>{tag.name}</span>
        ) : (
          <span className="text-red-600">[削除されたタグ]</span>
        )}
        を<span>{comparatorsLabel[conditions.comparator]}</span>
      </Card>
    );
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
