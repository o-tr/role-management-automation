import type { TMappingAction } from "@/types/actions";
import type { TMappingConditionInput } from "@/types/conditions";

export type ValidationErrors = {
  conditions: string[];
  actions: string[];
};

/**
 * 条件のバリデーション
 */
export const validateConditions = (
  conditions: TMappingConditionInput,
): string[] => {
  const errors: string[] = [];

  const validateCondition = (
    condition: TMappingConditionInput,
    path: string = "",
  ): void => {
    switch (condition.type) {
      case "comparator":
        if (!condition.comparator) {
          errors.push(`${path}比較方法を選択してください`);
        }
        if (condition.value === undefined) {
          errors.push(`${path}タグを選択してください`);
        } else if (
          Array.isArray(condition.value) &&
          condition.value.length === 0
        ) {
          errors.push(`${path}タグを選択してください`);
        }
        break;
      case "not":
        validateCondition(condition.condition, `${path}否定条件: `);
        break;
      case "and":
      case "or":
        if (!condition.conditions || condition.conditions.length === 0) {
          errors.push(`${path}条件を追加してください`);
        } else {
          condition.conditions.forEach((cond, index) => {
            validateCondition(cond, `${path}条件${index + 1}: `);
          });
        }
        break;
    }
  };

  validateCondition(conditions);
  return errors;
};

/**
 * アクションのバリデーション
 */
export const validateActions = (actions: TMappingAction[]): string[] => {
  const errors: string[] = [];

  if (actions.length === 0) {
    errors.push("アクションを追加してください");
    return errors;
  }

  actions.forEach((action, index) => {
    if (
      action.targetServiceAccountId === "" ||
      action.targetServiceAccountId === undefined
    ) {
      errors.push(
        `アクション${index + 1}: サービスアカウントを選択してください`,
      );
    }
    if (
      action.targetServiceGroupId === "" ||
      action.targetServiceGroupId === undefined
    ) {
      errors.push(`アクション${index + 1}: サービスグループを選択してください`);
    }
    if (action.type === "add" || action.type === "remove") {
      if (
        action.targetServiceRoleId === "" ||
        action.targetServiceRoleId === undefined
      ) {
        errors.push(`アクション${index + 1}: ロールを選択してください`);
      }
    }
  });

  return errors;
};
