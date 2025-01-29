import { prisma } from "../prisma";
import { formatTNamespaceWithOwnerAndAdmins } from "./format/formatTNamespaceWithOwnerAndAdmins";

export const createNamespace = async (name: string, ownerEmail: string) => {
  const namespace = await prisma.namespace.create({
    data: {
      name,
      owner: {
        connect: {
          email: ownerEmail,
        },
      },
    },
    include: {
      owner: true,
      admins: true,
    },
  });

  return formatTNamespaceWithOwnerAndAdmins(namespace);
};
