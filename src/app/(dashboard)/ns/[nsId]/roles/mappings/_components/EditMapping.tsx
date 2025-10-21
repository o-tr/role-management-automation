import type { FC } from "react";
import { Button } from "@/components/ui/button";
import type {
  TMappingCondition,
  TMappingConditionInput,
} from "@/types/conditions";
import type { TMapping } from "@/types/prisma";
import { onServiceGroupMappingChange } from "../../_hooks/on-mappings-change";
import { useUpdateServiceMapping } from "../../_hooks/use-update-service-mapping";
import { useMappingForm } from "../_hooks/useMappingForm";
import { ActionsEditor } from "./ActionsEditor";
import { ConditionsEditor } from "./ConditionsEditor";
import { ValidationError } from "./ValidationError";

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
  const { updateServiceMapping } = useUpdateServiceMapping(nsId, mapping.id);

  const {
    conditions,
    actions,
    conditionErrors,
    actionErrors,
    setConditions,
    setActions,
    handleSubmit,
  } = useMappingForm({
    initialConditions: convertToInput(mapping.conditions),
    initialActions: mapping.actions,
    onSubmit: async ({ conditions, actions }) => {
      await updateServiceMapping({ conditions, actions });
      onServiceGroupMappingChange();
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span>以下の条件に一致するとき、</span>
        <ConditionsEditor
          conditions={conditions}
          onChange={setConditions}
          nsId={nsId}
        />
        <ValidationError errors={conditionErrors} title="条件のエラー" />
      </div>
      <div>
        <span>以下のアクションを実行する</span>
        <ActionsEditor actions={actions} onChange={setActions} nsId={nsId} />
        <ValidationError errors={actionErrors} title="アクションのエラー" />
      </div>
      <Button type="submit">更新</Button>
    </form>
  );
};
