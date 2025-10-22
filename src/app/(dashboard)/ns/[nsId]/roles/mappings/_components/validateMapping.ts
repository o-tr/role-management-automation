import type { TMappingAction } from "@/types/actions";
import { ZMappingAction } from "@/types/actions";
import type {
  TMappingCondition,
  TMappingConditionInput,
} from "@/types/conditions";
import { ZMappingCondition } from "@/types/conditions";

export type ValidationErrors = {
  conditions: string[];
  actions: string[];
};

/**
 * 条件のバリデーション
 */
export const validateConditions = (
  conditions: TMappingConditionInput,
): { errors: string[]; data?: TMappingCondition } => {
  const result = ZMappingCondition.safeParse(conditions);

  if (result.success) {
    return { errors: [], data: result.data };
  }

  return {
    errors: result.error.errors.map((err) => {
      const path = err.path.join(" > ");
      return path ? `${path}: ${err.message}` : err.message;
    }),
  };
};

/**
 * アクションのバリデーション
 */
export const validateActions = (actions: TMappingAction[]): string[] => {
  if (actions.length === 0) {
    return ["アクションを追加してください"];
  }

  const errors: string[] = [];

  actions.forEach((action, index) => {
    const result = ZMappingAction.safeParse(action);

    if (!result.success) {
      result.error.errors.forEach((err) => {
        errors.push(`アクション${index + 1}: ${err.message}`);
      });
    }
  });

  return errors;
};
