import type { TMappingAction } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";

/**
 * 条件のバリデーション
 */
export const validateConditions = (conditions: TMappingCondition): string[] => {
  const errors: string[] = [];

  const validateCondition = (condition: TMappingCondition): void => {
    switch (condition.type) {
      case "comparator":
        if (condition.value === undefined) {
          errors.push("タグを選択してください");
        } else if (condition.value === "00000000-0000-0000-0000-000000000000") {
          errors.push("プレースホルダーIDは使用できません");
        } else if (
          Array.isArray(condition.value) &&
          condition.value.length === 0
        ) {
          errors.push("タグを選択してください");
        }
        break;
      case "not":
        validateCondition(condition.condition);
        break;
      case "and":
      case "or":
        if (condition.conditions.length === 0) {
          errors.push("条件を追加してください");
        } else {
          condition.conditions.forEach(validateCondition);
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
