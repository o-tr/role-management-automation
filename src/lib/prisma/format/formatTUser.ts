import type { TUser, TUserId } from "@/types/prisma";
import type { User } from "@prisma/client";

export const formatTUser = (input: User): TUser => {
  return {
    id: input.id as TUserId,
    email: input.email,
    name: input.name,
    icon: input.image,
  };
};
