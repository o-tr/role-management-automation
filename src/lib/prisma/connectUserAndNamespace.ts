import type { TNamespaceId, TUserId } from "@/types/prisma";
import { prisma } from "../prisma";

export const connectUserAndNamespace = async (
  userId: TUserId,
  nsId: TNamespaceId,
): Promise<void> => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      namespaces: {
        connect: {
          id: nsId,
        },
      },
    },
  });
};
