import { type FC, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TMappingAction } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";
import type { TMapping } from "@/types/prisma";
import { onServiceGroupMappingChange } from "../../_hooks/on-mappings-change";
import { useUpdateServiceMapping } from "../../_hooks/use-update-service-mapping";
import { ActionsEditor } from "./ActionsEditor";
import { ConditionsEditor } from "./ConditionsEditor";

type Props = {
  nsId: string;
  mapping: TMapping;
};

export const EditMapping: FC<Props> = ({ nsId, mapping }) => {
  const [conditions, setConditions] = useState<TMappingCondition>(
    mapping.conditions,
  );
  const [actions, setActions] = useState<TMappingAction[]>(mapping.actions);
  const { updateServiceMapping } = useUpdateServiceMapping(nsId, mapping.id);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateServiceMapping({ conditions, actions });
    onServiceGroupMappingChange();
  };

  return (
    <form onSubmit={onSubmit}>
      <span>以下の条件に一致するとき、</span>
      <ConditionsEditor
        conditions={conditions}
        onChange={setConditions}
        nsId={nsId}
      />
      <span>以下のアクションを実行する</span>
      <ActionsEditor actions={actions} onChange={setActions} nsId={nsId} />
      <Button type="submit">更新</Button>
    </form>
  );
};
