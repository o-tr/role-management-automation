import { z } from "zod";
import { ZTagId } from "./prisma";
import { zodRecursive } from "./zodRecursive";

export const ZMappingKey = z.literal("some-tag");
export type TMappingKey = z.infer<typeof ZMappingKey>;
export const ZMappingKeys = ["some-tag"] as const;

export const ZMappingValue = ZTagId;
export type TMappingValue = z.infer<typeof ZMappingValue>;

export const ZMappingComparator = z.union([
  z.literal("notEquals"),
  z.literal("equals"),
  z.literal("contains-any"),
  z.literal("contains-all"),
]);
export type TMappingComparator = z.infer<typeof ZMappingComparator>;
export const ZMappingComparators = [
  "notEquals",
  "equals",
  "contains-any",
  "contains-all",
] as const;

export const ZMappingType = z.union([
  z.literal("comparator"),
  z.literal("not"),
  z.literal("and"),
  z.literal("or"),
]);
export type TMappingType = z.infer<typeof ZMappingType>;
export const ZMappingTypes = ["comparator", "not", "and", "or"] as const;

export const ZMappingConditionId = z
  .string()
  .uuid()
  .brand<"MappingConditionId">("MappingConditionId");
export type TMappingConditionId = z.infer<typeof ZMappingConditionId>;

export const ZMappingConditionComparator = z.lazy(() =>
  z
    .object({
      id: ZMappingConditionId,
      type: z.literal("comparator"),
      key: ZMappingKey,
      comparator: ZMappingComparator,
      value: z.union([ZMappingValue, z.array(ZMappingValue)]),
    })
    .refine(
      (data) => {
        if (Array.isArray(data.value)) {
          return data.value.length > 0;
        }
        return true;
      },
      {
        message: "タグを選択してください",
      },
    ),
);
export type TMappingConditionComparator = z.infer<
  typeof ZMappingConditionComparator
>;

export const ZMappingConditionAnd = z.lazy(() =>
  z.object({
    id: ZMappingConditionId,
    type: z.literal("and"),
    conditions: z.array(ZMappingCondition),
  }),
);
export type TMappingConditionAnd = z.infer<typeof ZMappingConditionAnd>;

export const ZMappingConditionOr = z.lazy(() =>
  z.object({
    id: ZMappingConditionId,
    type: z.literal("or"),
    conditions: z.array(ZMappingCondition),
  }),
);
export type TMappingConditionOr = z.infer<typeof ZMappingConditionOr>;

export const ZMappingCondition = zodRecursive((self) =>
  z.union([
    ZMappingConditionComparator,
    z.object({
      id: ZMappingConditionId,
      type: z.literal("not"),
      condition: self,
    }),
    z.object({
      id: ZMappingConditionId,
      type: z.literal("and"),
      conditions: z.array(self),
    }),
    z.object({
      id: ZMappingConditionId,
      type: z.literal("or"),
      conditions: z.array(self),
    }),
  ]),
);

export const ZMappingConditionNot = z.object({
  id: ZMappingConditionId,
  type: z.literal("not"),
  condition: ZMappingCondition,
});
export type TMappingConditionNot = z.infer<typeof ZMappingConditionNot>;

export type TMappingCondition = z.infer<typeof ZMappingCondition>;

// 入力受付用の型定義（値がundefined可能）
export const ZMappingConditionComparatorInput = z.lazy(() =>
  z
    .object({
      id: ZMappingConditionId,
      type: z.literal("comparator"),
      key: ZMappingKey,
      comparator: ZMappingComparator.optional(),
      value: z.union([ZMappingValue, z.array(ZMappingValue)]).optional(),
    })
    .refine(
      (data) => {
        if (data.value && Array.isArray(data.value)) {
          return data.value.length > 0;
        }
        return true;
      },
      {
        message: "タグを選択してください",
      },
    ),
);
export type TMappingConditionComparatorInput = z.infer<
  typeof ZMappingConditionComparatorInput
>;

export const ZMappingConditionAndInput = z.lazy(() =>
  z.object({
    id: ZMappingConditionId,
    type: z.literal("and"),
    conditions: z.array(ZMappingConditionInput).default([]),
  }),
);
export type TMappingConditionAndInput = z.infer<
  typeof ZMappingConditionAndInput
>;

export const ZMappingConditionOrInput = z.lazy(() =>
  z.object({
    id: ZMappingConditionId,
    type: z.literal("or"),
    conditions: z.array(ZMappingConditionInput).default([]),
  }),
);
export type TMappingConditionOrInput = z.infer<typeof ZMappingConditionOrInput>;

export const ZMappingConditionInput = zodRecursive((self) =>
  z.union([
    ZMappingConditionComparatorInput,
    z.object({
      id: ZMappingConditionId,
      type: z.literal("not"),
      condition: self,
    }),
    z.object({
      id: ZMappingConditionId,
      type: z.literal("and"),
      conditions: z.array(self).default([]),
    }),
    z.object({
      id: ZMappingConditionId,
      type: z.literal("or"),
      conditions: z.array(self).default([]),
    }),
  ]),
);

export const ZMappingConditionNotInput = z.object({
  id: ZMappingConditionId,
  type: z.literal("not"),
  condition: ZMappingConditionInput,
});
export type TMappingConditionNotInput = z.infer<
  typeof ZMappingConditionNotInput
>;

export type TMappingConditionInput = z.infer<typeof ZMappingConditionInput>;

export const createNewMappingCondition = (
  type: TMappingType,
): TMappingConditionInput => {
  switch (type) {
    case "comparator":
      return {
        type: "comparator",
        key: "some-tag",
        comparator: undefined,
        value: undefined,
        id: crypto.randomUUID() as TMappingConditionId,
      };
    case "not":
      return {
        type: "not",
        condition: createNewMappingCondition("comparator"),
        id: crypto.randomUUID() as TMappingConditionId,
      };
    case "and":
      return {
        type: "and",
        conditions: [
          createNewMappingCondition("comparator"),
          createNewMappingCondition("comparator"),
        ],
        id: crypto.randomUUID() as TMappingConditionId,
      };
    case "or":
      return {
        type: "or",
        conditions: [
          createNewMappingCondition("comparator"),
          createNewMappingCondition("comparator"),
        ],
        id: crypto.randomUUID() as TMappingConditionId,
      };
  }
};

// ZMappingConditionInputからZMappingConditionへの変換関数
export const convertInputToCondition = (
  input: TMappingConditionInput,
): TMappingCondition => {
  if (input.type === "comparator") {
    if (input.comparator == null || input.value == null) {
      throw new Error("Invalid condition: comparator and value are required");
    }
    return {
      id: input.id,
      type: "comparator",
      key: input.key,
      comparator: input.comparator,
      value: input.value,
    };
  }

  if (input.type === "not") {
    return {
      id: input.id,
      type: "not",
      condition: convertInputToCondition(input.condition),
    };
  }

  if (input.type === "and") {
    if (!input.conditions) {
      throw new Error(
        "Invalid condition: conditions array is required for 'and' type",
      );
    }
    return {
      id: input.id,
      type: "and",
      conditions: input.conditions.map(convertInputToCondition),
    };
  }

  if (input.type === "or") {
    if (!input.conditions) {
      throw new Error(
        "Invalid condition: conditions array is required for 'or' type",
      );
    }
    return {
      id: input.id,
      type: "or",
      conditions: input.conditions.map(convertInputToCondition),
    };
  }

  throw new Error("Invalid condition type");
};
