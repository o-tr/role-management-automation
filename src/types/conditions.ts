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
  z.object({
    id: ZMappingConditionId,
    type: z.literal("comparator"),
    key: ZMappingKey,
    comparator: ZMappingComparator,
    value: z.union([ZMappingValue, z.array(ZMappingValue)]),
  }),
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

// プレースホルダー用の有効なUUID（実際のタグIDに置き換えられる）
export const PLACEHOLDER_TAG_ID =
  "00000000-0000-0000-0000-000000000000" as TMappingValue;

export const createNewMappingCondition = (
  type: TMappingType,
): TMappingCondition => {
  switch (type) {
    case "comparator":
      return {
        type: "comparator",
        key: "some-tag",
        comparator: "equals",
        value: PLACEHOLDER_TAG_ID,
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
