import type { TNamespaceId, TUserId } from "@/types/prisma";
import { prisma } from "../prisma";

export const disconnectUserAndNamespace = async (
  userId: TUserId,
  nsId: TNamespaceId,
) => {
  await prisma.namespace.update({
    where: {
      id: nsId,
    },
    data: {
      admins: {
        disconnect: {
          id: userId,
        },
      },
    },
  });
};
