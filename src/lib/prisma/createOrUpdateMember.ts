import {
  type TMemberId,
  type TNamespaceId,
  ZExternalServiceName,
  ZMemberId,
  ZTagId,
} from "@/types/prisma";
import { z } from "zod";
import { prisma } from "../prisma";
import { createMember } from "./createMember";
import { updateMember } from "./updateMember";

const ZCreateOrUpdateMember = z.object({
  memberId: ZMemberId.optional(),
  services: z.array(
    z.object({
      memberId: z.string().optional(),
      service: ZExternalServiceName,
      serviceId: z.string(),
      serviceUsername: z.string().optional(),
      name: z.string(),
      icon: z.string().optional(),
    }),
  ),
  tags: z.array(ZTagId).optional(),
});
export const ZCreateOrUpdateMembers = z.array(ZCreateOrUpdateMember);
export type TCreateOrUpdateMembers = z.infer<typeof ZCreateOrUpdateMembers>;

export const createOrUpdateMember = async (
  namespaceId: TNamespaceId,
  members: TCreateOrUpdateMembers,
): Promise<{ id: TMemberId }[]> => {
  const results = await prisma.$transaction(async () => {
    return await Promise.all(
      members.map((member) =>
        member.memberId
          ? updateMember(namespaceId, member.memberId, {
              externalAccounts: member.services.map((service) => ({
                memberId: member.memberId,
                service: service.service,
                serviceId: service.serviceId,
                serviceUsername: service.serviceUsername,
                name: service.name,
                icon: service.icon,
              })),
              tags: member.tags
                ? member.tags.map((tagId) => ({ id: tagId }))
                : undefined,
            })
          : createMember(namespaceId, {
              tags: member.tags,
              externalAccounts: member.services.map((service) => ({
                service: service.service,
                serviceId: service.serviceId,
                serviceUsername: service.serviceUsername,
                name: service.name,
                icon: service.icon,
              })),
            }),
      ),
    );
  });
  return results;
};
