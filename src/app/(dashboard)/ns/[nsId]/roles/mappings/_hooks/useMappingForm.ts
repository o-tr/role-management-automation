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
  isDirty: boolean;
  setConditions: Dispatch<SetStateAction<TMappingConditionInput>>;
  setActions: Dispatch<SetStateAction<TMappingAction[]>>;
  handleSubmit: (e: FormEvent) => Promise<void>;
  resetForm: () => void;
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
  const [isDirty, setIsDirty] = useState(false);

  const setConditions: Dispatch<SetStateAction<TMappingConditionInput>> = (
    newConditions,
  ) => {
    setConditionsState(newConditions);
    setIsDirty(true);
    // 条件変更時にエラーをクリア
    if (conditionErrors.length > 0) {
      setConditionErrors([]);
    }
  };

  const setActions: Dispatch<SetStateAction<TMappingAction[]>> = (
    newActions,
  ) => {
    setActionsState(newActions);
    setIsDirty(true);
    // アクション変更時にエラーをクリア
    if (actionErrors.length > 0) {
      setActionErrors([]);
    }
  };

  const resetForm = () => {
    setConditionsState(initialConditions);
    setActionsState(initialActions);
    setConditionErrors([]);
    setActionErrors([]);
    setIsDirty(false);
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
    setIsDirty(false);
  };

  return {
    conditions,
    actions,
    conditionErrors,
    actionErrors,
    isDirty,
    setConditions,
    setActions,
    handleSubmit,
    resetForm,
  };
};
