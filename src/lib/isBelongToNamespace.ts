import type { TNamespaceWithOwnerAndAdmins, TUserId } from "@/types/prisma";

export const isBelongToNamespace = (
  namespace: TNamespaceWithOwnerAndAdmins,
  userId: TUserId,
) => {
  return (
    namespace.ownerId === userId ||
    namespace.admins.some((admin) => admin.id === userId)
  );
};
