import type { TColorCode } from "@/types/brand";
import type { TNamespaceId, TTag } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTTag } from "./format/formatTTag";

type TCreateTag = {
  name: string;
  color: TColorCode;
};

export const createTag = async (
  nsId: TNamespaceId,
  data: TCreateTag,
): Promise<TTag> => {
  const result = await prisma.tag.create({
    data: {
      name: data.name,
      color: data.color,
      namespace: { connect: { id: nsId } },
    },
  });
  return formatTTag(result);
};
