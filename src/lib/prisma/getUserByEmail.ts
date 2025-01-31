import type { TUser } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTUser } from "./format/formatTUser";

export const getUserByEmail = async (email: string): Promise<TUser | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return null;
  }
  return formatTUser(user);
};
