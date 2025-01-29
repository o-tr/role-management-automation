import type { FUser, TUser } from "@/types/prisma";

export const filterFUser = (user: TUser): FUser => {
  return {
    id: user.id,
    name: user.name,
  };
};
