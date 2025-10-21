"use client";

import type { FC } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createNewMappingAction } from "@/types/actions";
import { createNewMappingCondition } from "@/types/conditions";
import { onServiceGroupMappingChange } from "../../_hooks/on-mappings-change";
import { useCreateServiceMapping } from "../../_hooks/use-create-service-mapping";
import { useMappingForm } from "../_hooks/useMappingForm";
import { ActionsEditor } from "./ActionsEditor";
import { ConditionsEditor } from "./ConditionsEditor";
import { ValidationError } from "./ValidationError";

type Props = {
  nsId: string;
  onDirtyChange?: (isDirty: boolean) => void;
};

export const AddMapping: FC<Props> = ({ nsId, onDirtyChange }) => {
  const { createServiceMapping, loading } = useCreateServiceMapping(nsId);

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
    initialConditions: createNewMappingCondition("comparator"),
    initialActions: [createNewMappingAction("add")],
    onSubmit: async ({ conditions, actions }) => {
      await createServiceMapping({
        conditions,
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
      <Button disabled={loading} type="submit">
        作成
      </Button>
    </form>
  );
};
