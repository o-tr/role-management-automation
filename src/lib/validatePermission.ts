import type {
  TNamespace,
  TNamespaceId,
  TNamespaceWithOwnerAndAdmins,
} from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { ForbiddenException } from "./exceptions/ForbiddenException";
import { NotFoundException } from "./exceptions/NotFoundException";
import { getNamespaceWithOwnerAndAdmins } from "./prisma/getNamespaceWithOwnerAndAdmin";
import { UnauthorizedError } from "./vrchat/retry";

export const validatePermission = async (
  nsId: TNamespaceId,
  requiredPermission: "owner" | "admin",
): Promise<TNamespaceWithOwnerAndAdmins & { isOwner: boolean }> => {
  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) {
    throw new UnauthorizedError("Not authenticated");
  }
  const namespace = await getNamespaceWithOwnerAndAdmins(nsId);
  if (!namespace) {
    throw new NotFoundException("Namespace not found");
  }
  if (requiredPermission === "owner") {
    if (namespace.owner.email !== email) {
      throw new ForbiddenException("Not authorized");
    }
    return {
      ...namespace,
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
      isOwner: namespace.owner.email === email,
    };
  }
  throw new Error("Invalid permission");
};
