import type {
  TNamespace,
  TNamespaceId,
  TNamespaceWithOwnerAndAdmins,
  TUser,
} from "@/types/prisma";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { ForbiddenException } from "./exceptions/ForbiddenException";
import { NotFoundException } from "./exceptions/NotFoundException";
import { getNamespaceWithOwnerAndAdmins } from "./prisma/getNamespaceWithOwnerAndAdmin";
import { getUserByEmail } from "./prisma/getUserByEmail";
import { UnauthorizedError } from "./vrchat/retry";

export const requireLoggedIn = async (): Promise<TUser> => {
  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) {
    throw new UnauthorizedError("Not authenticated");
  }
  const user = await getUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError("User not found");
  }
  return user;
};

export const validatePermission = async (
  nsId: TNamespaceId,
  requiredPermission: "owner" | "admin",
): Promise<
  TNamespaceWithOwnerAndAdmins & { isOwner: boolean; user: TUser }
> => {
  const user = await requireLoggedIn();
  const namespace = await getNamespaceWithOwnerAndAdmins(nsId);
  if (!namespace) {
    throw new NotFoundException("Namespace not found");
  }
  if (requiredPermission === "owner") {
    if (namespace.owner.email !== user.email) {
      throw new ForbiddenException("Forbidden");
    }
    return {
      ...namespace,
      user,
      isOwner: true,
    };
  }
  if (requiredPermission === "admin") {
    if (
      !namespace.admins.find((admin) => admin.email === user.email) &&
      namespace.owner.email !== user.email
    ) {
      throw new ForbiddenException("Forbidden");
    }
    return {
      ...namespace,
      user,
      isOwner: namespace.owner.email === user.email,
    };
  }
  throw new Error("Invalid permission");
};
