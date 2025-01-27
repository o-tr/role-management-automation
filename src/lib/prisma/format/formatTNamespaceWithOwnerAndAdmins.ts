import type {
  TNamespaceId,
  TNamespaceWithOwnerAndAdmins,
} from "@/types/prisma";
import type { Namespace, User } from "@prisma/client";
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
    admins: input.admins.map(formatTUser),
  };
};
