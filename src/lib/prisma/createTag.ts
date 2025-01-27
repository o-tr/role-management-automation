import type { TNamespaceId, TTag } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTTag } from "./format/formatTTag";

type TCreateTag = {
  name: string;
};

export const createTag = async (
  nsId: TNamespaceId,
  data: TCreateTag,
): Promise<TTag> => {
  const result = await prisma.tag.create({
    data: {
      name: data.name,
      namespace: { connect: { id: nsId } },
    },
  });
  return formatTTag(result);
};
