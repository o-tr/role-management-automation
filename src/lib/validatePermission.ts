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

export const validatePermission = async (
  nsId: TNamespaceId,
  requiredPermission: "owner" | "admin" | "logged-in",
): Promise<
  TNamespaceWithOwnerAndAdmins & { isOwner: boolean; user: TUser }
> => {
  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) {
    throw new UnauthorizedError("Not authenticated");
  }
  const user = await getUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError("User not found");
  }
  const namespace = await getNamespaceWithOwnerAndAdmins(nsId);
  if (!namespace) {
    throw new NotFoundException("Namespace not found");
  }
  if (requiredPermission === "logged-in") {
    return {
      ...namespace,
      user,
      isOwner: false,
    };
  }
  if (requiredPermission === "owner") {
    if (namespace.owner.email !== email) {
      throw new ForbiddenException("Not authorized");
    }
    return {
      ...namespace,
      user,
      isOwner: true,
    };
  }
  if (requiredPermission === "admin") {
    if (
      !namespace.admins.find((admin) => admin.email === email) &&
      namespace.owner.email !== email
    ) {
      throw new ForbiddenException("Not authorized");
    }
    return {
      ...namespace,
      user,
      isOwner: namespace.owner.email === email,
    };
  }
  throw new Error("Invalid permission");
};
