import {
  TMember,
  type TNamespaceId,
  type TNamespaceWithRelation,
} from "@/types/prisma";
import type { Member, Namespace, Tag, User } from "@prisma/client";
import { formatTMember } from "./formatTMember";
import { formatTTag } from "./formatTTag";
import { formatTUser } from "./formatTUser";

export const formatTNamespaceWithRelation = (
  input: Namespace & {
    owner: User;
    admins: User[];
    members: Member[];
    tags: Tag[];
  },
): TNamespaceWithRelation => {
  return {
    id: input.id as TNamespaceId,
    name: input.name,
    owner: formatTUser(input.owner),
    admins: input.admins.map(formatTUser),
    members: input.members.map(formatTMember),
    tags: input.tags.map(formatTTag),
  };
};
