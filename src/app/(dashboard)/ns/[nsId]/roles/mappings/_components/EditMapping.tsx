import type { FC } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type {
  TMappingCondition,
  TMappingConditionInput,
} from "@/types/conditions";
import { convertInputToCondition } from "@/types/conditions";
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
  onDirtyChange?: (isDirty: boolean) => void;
};

const convertToInput = (
  condition: TMappingCondition,
): TMappingConditionInput => {
  if (condition.type === "comparator") {
    return condition;
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

export const EditMapping: FC<Props> = ({ nsId, mapping, onDirtyChange }) => {
  const { updateServiceMapping } = useUpdateServiceMapping(nsId, mapping.id);

  const {
    conditions,
    actions,
    conditionErrors,
    actionErrors,
    isDirty,
    setConditions,
    setActions,
    handleSubmit,
  } = useMappingForm({
    initialConditions: convertToInput(mapping.conditions),
    initialActions: mapping.actions,
    onSubmit: async ({ conditions, actions }) => {
      await updateServiceMapping({
        conditions: convertInputToCondition(conditions),
        actions,
      });
      onServiceGroupMappingChange();
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset>
        <legend>以下の条件に一致するとき、</legend>
        <ConditionsEditor
          conditions={conditions}
          onChange={setConditions}
          nsId={nsId}
        />
        <ValidationError errors={conditionErrors} title="条件のエラー" />
      </fieldset>
      <fieldset>
        <legend>以下のアクションを実行する</legend>
        <ActionsEditor actions={actions} onChange={setActions} nsId={nsId} />
        <ValidationError errors={actionErrors} title="アクションのエラー" />
      </fieldset>
      <Button type="submit">更新</Button>
    </form>
  );
};
