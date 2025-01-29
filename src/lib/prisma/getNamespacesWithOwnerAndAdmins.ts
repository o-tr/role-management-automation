import { prisma } from "../prisma";
import { formatTNamespaceWithOwnerAndAdmins } from "./format/formatTNamespaceWithOwnerAndAdmins";

export const getNamespacesWithOwnerAndAdmins = async (email: string) => {
  const namespaces = await prisma.namespace.findMany({
    where: {
      admins: {
        some: {
          email: email,
        },
      },
    },
    include: {
      owner: true,
      admins: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return namespaces.map(formatTNamespaceWithOwnerAndAdmins);
};
