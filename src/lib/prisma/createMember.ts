import {
  type TMember,
  TMemberId,
  type TNamespaceId,
  type TTagId,
} from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";
import { prisma } from "../prisma";
import { formatTMember } from "./format/formatTMember";

type TMemberCreateInput = {
  tags: TTagId[] | undefined;
  externalAccounts: {
    service: ExternalServiceName;
    serviceId: string;
    serviceUsername: string | undefined;
    name: string;
    icon: string | undefined;
  }[];
};

export const createMember = async (
  namespaceId: TNamespaceId,
  member: TMemberCreateInput,
): Promise<TMember> => {
  const result = await prisma.member.create({
    data: {
      namespaceId: namespaceId,
      tags: member.tags
        ? {
            connect: member.tags.map((id) => ({ id })),
          }
        : undefined,
      externalAccounts: {
        create: member.externalAccounts.map((account) => ({
          service: account.service,
          serviceId: account.serviceId,
          serviceUsername: account.serviceUsername,
          name: account.name,
          icon: account.icon,
          namespaceId: namespaceId,
        })),
      },
    },
  });
  return formatTMember(result);
};
