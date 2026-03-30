import type { FC } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { convertConditionToInput } from "@/types/conditions";
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

export const EditMapping: FC<Props> = ({ nsId, mapping, onDirtyChange }) => {
  const { updateServiceMapping, loading } = useUpdateServiceMapping(
    nsId,
    mapping.id,
  );
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
    initialConditions: convertConditionToInput(mapping.conditions),
    initialActions: mapping.actions,
    onSubmit: async ({ conditions, actions }) => {
      try {
        await updateServiceMapping({
          conditions,
          actions,
        });
        onServiceGroupMappingChange();
      } catch (error) {
        toast({
          title: "割り当て更新に失敗しました",
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
        />
        <ValidationError errors={conditionErrors} title="条件のエラー" />
      </fieldset>
      <fieldset>
        <legend>以下のアクションを実行する</legend>
        <ActionsEditor actions={actions} onChange={setActions} nsId={nsId} />
        <ValidationError errors={actionErrors} title="アクションのエラー" />
      </fieldset>
      <Button type="submit" disabled={loading || isSubmitting}>
        更新
      </Button>
    </form>
  );
};
