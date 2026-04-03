"use client";

import type { FC } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

  const {
    conditions,
    actions,
    conditionErrors,
    actionErrors,
    isDirty,
    isSubmitting,
    setConditions,
    setActions,
    handleSubmit,
  } = useMappingForm({
    initialConditions: createNewMappingCondition("comparator"),
    initialActions: [createNewMappingAction("add")],
    onSubmit: async ({ conditions, actions }) => {
      try {
        await createServiceMapping({
          conditions,
          actions,
        });
        onServiceGroupMappingChange();
      } catch (error) {
        toast({
          title: "割り当て作成に失敗しました",
          description:
            error instanceof Error
              ? error.message
              : "しばらくしてから再度お試しください。",
          variant: "destructive",
        });
        throw error;
      }
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
          disabled={loading || isSubmitting}
        />
        <ValidationError errors={conditionErrors} title="条件のエラー" />
      </fieldset>
      <fieldset>
        <legend>以下のアクションを実行する</legend>
        <ActionsEditor
          actions={actions}
          onChange={setActions}
          nsId={nsId}
          disabled={loading || isSubmitting}
        />
        <ValidationError errors={actionErrors} title="アクションのエラー" />
      </fieldset>
      <Button disabled={loading || isSubmitting} type="submit">
        作成
      </Button>
    </form>
  );
};
