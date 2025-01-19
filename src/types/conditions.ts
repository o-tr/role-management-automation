import { z } from "zod";
import { ZTagId } from "./prisma";
import { zodRecursive } from "./zodRecursive";

export const ZMappingKey = z.literal("some-tag");

export const ZMappingValue = ZTagId;

export const ZMappingComparator = z.union([
  z.literal("notEquals"),
  z.literal("equals"),
]);

export const ZMappingCondition = zodRecursive((self) =>
  z.union([
    z.object({
      type: z.literal("comparator"),
      key: ZMappingKey,
      comparator: ZMappingComparator,
      value: ZMappingValue,
    }),
    z.object({
      type: z.literal("not"),
      condition: self,
    }),
    z.object({
      type: z.literal("and"),
      conditions: z.array(self),
    }),
    z.object({
      type: z.literal("or"),
      conditions: z.array(self),
    }),
  ]),
);

export type TMappingCondition = z.infer<typeof ZMappingCondition>;
