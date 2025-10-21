import { type FC, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TMappingAction } from "@/types/actions";
import type {
  TMappingCondition,
  TMappingConditionInput,
} from "@/types/conditions";
import type { TMapping } from "@/types/prisma";
import { onServiceGroupMappingChange } from "../../_hooks/on-mappings-change";
import { useUpdateServiceMapping } from "../../_hooks/use-update-service-mapping";
import { ActionsEditor } from "./ActionsEditor";
import { ConditionsEditor } from "./ConditionsEditor";
import { ValidationError } from "./ValidationError";
import { validateActions, validateConditions } from "./validateMapping";

type Props = {
  nsId: string;
  mapping: TMapping;
};

const convertToInput = (
  condition: TMappingCondition,
): TMappingConditionInput => {
  if (condition.type === "comparator") {
    return {
      ...condition,
      value: condition.value,
    };
  }
  if (condition.type === "not") {
    return {
      ...condition,
      condition: convertToInput(condition.condition),
    };
  }
  return {
    ...condition,
    conditions: condition.conditions.map(convertToInput),
  };
};

export const EditMapping: FC<Props> = ({ nsId, mapping }) => {
  const [conditions, setConditions] = useState<TMappingConditionInput>(
    convertToInput(mapping.conditions),
  );
  const [actions, setActions] = useState<TMappingAction[]>(mapping.actions);
  const [conditionErrors, setConditionErrors] = useState<string[]>([]);
  const [actionErrors, setActionErrors] = useState<string[]>([]);
  const { updateServiceMapping } = useUpdateServiceMapping(nsId, mapping.id);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // バリデーション実行
    const newConditionErrors = validateConditions(conditions);
    const newActionErrors = validateActions(actions);

    setConditionErrors(newConditionErrors);
    setActionErrors(newActionErrors);

    if (newConditionErrors.length > 0 || newActionErrors.length > 0) {
      return; // 送信をキャンセル
    }

    await updateServiceMapping({ conditions, actions });
    onServiceGroupMappingChange();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <span>以下の条件に一致するとき、</span>
        <ConditionsEditor
          conditions={conditions}
          onChange={(v) => {
            setConditions(v);
            // 条件変更時にエラーをクリア
            if (conditionErrors.length > 0) {
              setConditionErrors([]);
            }
          }}
          nsId={nsId}
        />
        <ValidationError errors={conditionErrors} title="条件のエラー" />
      </div>
      <div>
        <span>以下のアクションを実行する</span>
        <ActionsEditor
          actions={actions}
          onChange={(v) => {
            setActions(v);
            // アクション変更時にエラーをクリア
            if (actionErrors.length > 0) {
              setActionErrors([]);
            }
          }}
          nsId={nsId}
        />
        <ValidationError errors={actionErrors} title="アクションのエラー" />
      </div>
      <Button type="submit">更新</Button>
    </form>
  );
};
