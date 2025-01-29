import {
  type TMemberExternalServiceAccountId,
  type TMemberId,
  type TMemberWithRelation,
  type TNamespaceId,
  type TTagId,
  ZExternalServiceName,
} from "@/types/prisma";
import { z } from "zod";
import { prisma } from "../prisma";
import { formatTMemberWithRelation } from "./format/formatTMemberWithRelation";
import { getMemberWithRelation } from "./getMemberWithRelation";

export const ZMemberUpdateInput = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  tags: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .optional(),
  externalAccounts: z
    .array(
      z.object({
        memberId: z.string().optional(),
        service: ZExternalServiceName,
        serviceId: z.string(),
        serviceUsername: z.string().nullable().optional(),
        name: z.string(),
        icon: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export type TMemberUpdateInput = z.infer<typeof ZMemberUpdateInput>;

export const updateMember = async (
  nsId: TNamespaceId,
  id: TMemberId,
  data: TMemberUpdateInput,
  tagAppendOnly = false,
): Promise<TMemberWithRelation> => {
  const result = await prisma.$transaction(async () => {
    const member = await getMemberWithRelation(nsId, id);
    if (!member) {
      throw new Error("Member not found");
    }
    if (data.externalAccounts) {
      for (const account of member.externalAccounts) {
        const newAccount = data.externalAccounts.find(
          (a) =>
            a.service === account.service && a.serviceId === account.serviceId,
        );
        if (!newAccount) {
          await prisma.memberExternalServiceAccount.delete({
            where: {
              id: account.id,
            },
          });
        } else {
          await prisma.memberExternalServiceAccount.update({
            where: {
              id: account.id,
            },
            data: {
              service: newAccount.service,
              serviceId: newAccount.serviceId,
              serviceUsername: newAccount.serviceUsername,
              name: newAccount.name,
              icon: newAccount.icon,
            },
          });
        }
      }
      for (const account of data.externalAccounts) {
        if (
          !member.externalAccounts.find(
            (a) =>
              a.service === account.service &&
              a.serviceId === account.serviceId,
          )
        ) {
          await prisma.memberExternalServiceAccount.create({
            data: {
              memberId: id,
              service: account.service,
              serviceId: account.serviceId,
              serviceUsername: account.serviceUsername,
              name: account.name,
              icon: account.icon,
              namespaceId: nsId,
            },
          });
        }
      }
      return await prisma.member.update({
        where: {
          id: id,
        },
        data: {
          tags: data.tags
            ? tagAppendOnly
              ? {
                  connect: data.tags.map((tag) => ({ id: tag.id })),
                }
              : {
                  set: data.tags.map((tag) => ({ id: tag.id })),
                }
            : undefined,
        },
        include: {
          externalAccounts: true,
          tags: true,
        },
      });
    }
  });
  if (!result) {
    throw new Error("Member not found");
  }
  return formatTMemberWithRelation(result);
};
