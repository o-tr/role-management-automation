"use client";

import { type FC, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createNewMappingAction, type TMappingAction } from "@/types/actions";
import {
  createNewMappingCondition,
  type TMappingCondition,
} from "@/types/conditions";
import { onServiceGroupMappingChange } from "../../_hooks/on-mappings-change";
import { useCreateServiceMapping } from "../../_hooks/use-create-service-mapping";
import { ActionsEditor } from "./ActionsEditor";
import { ConditionsEditor } from "./ConditionsEditor";
import { validateActions, validateConditions } from "./validateMapping";

type Props = {
  nsId: string;
};

export const AddMapping: FC<Props> = ({ nsId }) => {
  const [conditions, setConditions] = useState<TMappingCondition>(
    createNewMappingCondition("comparator"),
  );
  const [actions, setActions] = useState<TMappingAction[]>([
    createNewMappingAction("add"),
  ]);
  const { createServiceMapping, loading } = useCreateServiceMapping(nsId);
  const { toast } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // バリデーション実行
    const conditionErrors = validateConditions(conditions);
    const actionErrors = validateActions(actions);

    console.log("Validation errors:", { conditionErrors, actionErrors });

    if (conditionErrors.length > 0 || actionErrors.length > 0) {
      const errorMessage = [...conditionErrors, ...actionErrors].join("\n");
      console.log("Showing toast with message:", errorMessage);
      toast({
        title: "入力エラー",
        description: errorMessage,
        variant: "destructive",
      });
      return; // 送信をキャンセル
    }

    await createServiceMapping({ conditions, actions });
    onServiceGroupMappingChange();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <span>以下の条件に一致するとき、</span>
      <ConditionsEditor
        conditions={conditions}
        onChange={(v) => setConditions(v)}
        nsId={nsId}
      />
      <span>以下のアクションを実行する</span>
      <ActionsEditor actions={actions} onChange={setActions} nsId={nsId} />
      <Button disabled={loading} type="submit">
        作成
      </Button>
    </form>
  );
};
