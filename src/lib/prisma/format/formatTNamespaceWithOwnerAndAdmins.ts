import type { Namespace, User } from "@prisma/client";
import type {
  TNamespaceId,
  TNamespaceWithOwnerAndAdmins,
  TUserId,
} from "@/types/prisma";
import { formatTUser } from "./formatTUser";

export const formatTNamespaceWithOwnerAndAdmins = (
  input: Namespace & {
    owner: User;
    admins: User[];
  },
): TNamespaceWithOwnerAndAdmins => {
  return {
    id: input.id as TNamespaceId,
    name: input.name,
    owner: formatTUser(input.owner),
    ownerId: input.ownerId as TUserId,
    admins: input.admins.map(formatTUser),
  };
};
