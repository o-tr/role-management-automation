import type {
  TExternalServiceAccountId,
  TExternalServiceGroup,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTExternalServiceGroup } from "./format/formatTExternalServiceGroup";

type CreateExternalServiceGroupInput = {
  groupId: string;
  name: string;
  icon?: string;
};

export const createExternalServiceGroup = async (
  namespaceId: TNamespaceId,
  externalAccountId: TExternalServiceAccountId,
  input: CreateExternalServiceGroupInput,
): Promise<TExternalServiceGroup> => {
  const result = await prisma.externalServiceGroup.create({
    data: {
      name: input.name,
      groupId: input.groupId,
      icon: input.icon,
      account: { connect: { id: externalAccountId } },
      namespace: { connect: { id: namespaceId } },
    },
    include: {
      account: true,
    },
  });

  return formatTExternalServiceGroup(result);
};
