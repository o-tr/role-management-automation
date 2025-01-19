"use client";

import { Button } from "@/components/ui/button";
import { type TMappingAction, createNewMappingAction } from "@/types/actions";
import {
  type TMappingCondition,
  createNewMappingCondition,
} from "@/types/conditions";
import { type FC, type FormEvent, useState } from "react";
import { useCreateServiceMapping } from "../_hooks/use-create-service-mapping";
import { ActionsEditor } from "./ActionsEditor";
import { ConditionsEditor } from "./ConditionsEditor";

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    createServiceMapping({ conditions, actions });
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
