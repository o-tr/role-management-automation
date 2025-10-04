import { z } from "zod";
import { ZColorCode } from "@/types/brand";
import type { TNamespaceId, TTag, TTagId } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTTag } from "./format/formatTTag";

export const ZUpdateTagInput = z.object({
  name: z.string().min(1, "Name is required").optional(),
  color: ZColorCode.optional(),
});
export type UpdateTagInput = z.infer<typeof ZUpdateTagInput>;

export const updateTag = async (
  namespaceId: TNamespaceId,
  tagId: TTagId,
  data: UpdateTagInput,
): Promise<TTag> => {
  const result = await prisma.tag.update({
    where: {
      namespaceId: namespaceId,
      id: tagId,
    },
    data: {
      name: data.name,
      color: data.color,
    },
  });
  return formatTTag(result);
};
