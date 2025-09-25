import type { TNamespaceWithRelation } from "@/types/prisma";
import type { Member, Namespace, Tag, User } from "@prisma/client";
import { formatTMember } from "./formatTMember";
import { formatTNamespaceWithOwnerAndAdmins } from "./formatTNamespaceWithOwnerAndAdmins";
import { formatTTag } from "./formatTTag";

export const formatTNamespaceWithRelation = (
  input: Namespace & {
    owner: User;
    admins: User[];
    members: Member[];
    tags: Tag[];
  },
): TNamespaceWithRelation => {
  return {
    ...formatTNamespaceWithOwnerAndAdmins(input),
    members: input.members.map(formatTMember),
    tags: input.tags.map(formatTTag),
  };
};
