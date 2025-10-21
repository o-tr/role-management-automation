"use client";

import { type FC, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { createNewMappingAction, type TMappingAction } from "@/types/actions";
import {
  createNewMappingCondition,
  type TMappingConditionInput,
} from "@/types/conditions";
import { onServiceGroupMappingChange } from "../../_hooks/on-mappings-change";
import { useCreateServiceMapping } from "../../_hooks/use-create-service-mapping";
import { ActionsEditor } from "./ActionsEditor";
import { ConditionsEditor } from "./ConditionsEditor";
import { ValidationError } from "./ValidationError";
import { validateActions, validateConditions } from "./validateMapping";

type Props = {
  nsId: string;
};

export const AddMapping: FC<Props> = ({ nsId }) => {
  const [conditions, setConditions] = useState<TMappingConditionInput>(
    createNewMappingCondition("comparator"),
  );
  const [actions, setActions] = useState<TMappingAction[]>([
    createNewMappingAction("add"),
  ]);
  const [conditionErrors, setConditionErrors] = useState<string[]>([]);
  const [actionErrors, setActionErrors] = useState<string[]>([]);
  const { createServiceMapping, loading } = useCreateServiceMapping(nsId);

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

    await createServiceMapping({ conditions, actions });
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
      <Button disabled={loading} type="submit">
        作成
      </Button>
    </form>
  );
};
