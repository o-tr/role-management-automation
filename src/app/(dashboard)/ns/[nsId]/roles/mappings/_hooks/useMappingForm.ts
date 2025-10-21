import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useState,
} from "react";
import type { TMappingAction } from "@/types/actions";
import type { TMappingConditionInput } from "@/types/conditions";
import {
  validateActions,
  validateConditions,
} from "../_components/validateMapping";

type UseMappingFormProps = {
  initialConditions: TMappingConditionInput;
  initialActions: TMappingAction[];
  onSubmit: (data: {
    conditions: TMappingConditionInput;
    actions: TMappingAction[];
  }) => Promise<void>;
};

type UseMappingFormReturn = {
  conditions: TMappingConditionInput;
  actions: TMappingAction[];
  conditionErrors: string[];
  actionErrors: string[];
  setConditions: (conditions: TMappingConditionInput) => void;
  setActions: Dispatch<SetStateAction<TMappingAction[]>>;
  handleSubmit: (e: FormEvent) => Promise<void>;
};

export const useMappingForm = ({
  initialConditions,
  initialActions,
  onSubmit,
}: UseMappingFormProps): UseMappingFormReturn => {
  const [conditions, setConditionsState] =
    useState<TMappingConditionInput>(initialConditions);
  const [actions, setActionsState] = useState<TMappingAction[]>(initialActions);
  const [conditionErrors, setConditionErrors] = useState<string[]>([]);
  const [actionErrors, setActionErrors] = useState<string[]>([]);

  const setConditions = (newConditions: TMappingConditionInput) => {
    setConditionsState(newConditions);
    // 条件変更時にエラーをクリア
    if (conditionErrors.length > 0) {
      setConditionErrors([]);
    }
  };

  const setActions: Dispatch<SetStateAction<TMappingAction[]>> = (
    newActions,
  ) => {
    setActionsState(newActions);
    // アクション変更時にエラーをクリア
    if (actionErrors.length > 0) {
      setActionErrors([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // バリデーション実行
    const newConditionErrors = validateConditions(conditions);
    const newActionErrors = validateActions(actions);

    setConditionErrors(newConditionErrors);
    setActionErrors(newActionErrors);

    if (newConditionErrors.length > 0 || newActionErrors.length > 0) {
      return; // 送信をキャンセル
    }

    await onSubmit({ conditions, actions });
  };

  return {
    conditions,
    actions,
    conditionErrors,
    actionErrors,
    setConditions,
    setActions,
    handleSubmit,
  };
};
