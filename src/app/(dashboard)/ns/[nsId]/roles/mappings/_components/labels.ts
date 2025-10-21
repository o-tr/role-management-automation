import type { TMappingComparator, TMappingKey } from "@/types/conditions";

export const keysLabel: { [key in TMappingKey]: string } = {
  "some-tag": "タグ",
};

export const comparatorsLabel: { [key in TMappingComparator]: string } = {
  notEquals: "と一致しない",
  equals: "と一致する",
  "contains-any": "のいずれかと一致する",
  "contains-all": "のすべてと一致する",
};
