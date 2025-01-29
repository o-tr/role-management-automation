import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { compareDiff } from "@/lib/mapping/compareDiff";
import { calculateDiff, extractTargetGroups } from "@/lib/mapping/memberDiff";
import { convertTSerializedMappingToTMapping } from "@/lib/prisma/convert/convertTSerializedMappingToTMapping";
import { getExternalServiceGroupRoleMappingsByNamespaceId } from "@/lib/prisma/getExternalServiceGroupRoleMappingByNamespaceId";
import { getExternalServiceGroups } from "@/lib/prisma/getExternalServiceGroups";
import { getMembersWithRelation } from "@/lib/prisma/getMembersWithRelation";
import { validatePermission } from "@/lib/validatePermission";
import { type TMemberWithDiff, ZMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getMembers } from "../../services/accounts/[accountId]/groups/[groupId]/members/getMembers";
import { type ApplyDiffResult, applyDiff } from "./applyDiff";

export type ApplyMappingRequestResponse =
  | {
      status: "success";
      result: ApplyDiffResult[];
    }
  | {
      status: "error";
      error: string;
    };

const ZApplyMappingSchema = z.array(ZMemberWithDiff);
export type TApplyMappingRequestBody = z.infer<typeof ZApplyMappingSchema>;

export const POST = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<ApplyMappingRequestResponse> => {
    await validatePermission(params.nsId, "admin");

    const body = ZApplyMappingSchema.safeParse(await req.json());

    if (!body.success) {
      throw new BadRequestException("Invalid request body");
    }

    const requestBody = body.data;
    const diff = await getMemberWithDiff(params.nsId);

    if (!compareDiff(diff, requestBody)) {
      console.log(requestBody, diff);
      throw new BadRequestException("Invalid request body");
    }

    const result = await applyDiff(params.nsId, requestBody);

    return {
      status: "success",
      result,
    };
  },
);

const getMemberWithDiff = async (
  nsId: TNamespaceId,
): Promise<TMemberWithDiff[]> => {
  const members = await getMembersWithRelation(nsId);
  const mappings = (
    await getExternalServiceGroupRoleMappingsByNamespaceId(nsId)
  ).map(convertTSerializedMappingToTMapping);
  const groups = await getExternalServiceGroups(nsId);
  const targetGroups = extractTargetGroups(groups, mappings);
  const groupMembers = await Promise.all(
    targetGroups.map(async (targetGroup) => {
      const group = groups.find(
        (group) =>
          group.account.id === targetGroup.serviceAccountId &&
          group.id === targetGroup.serviceGroupId,
      );
      if (!group) {
        throw new Error("Group not found");
      }
      const groupMembers = await getMembers(group);
      return {
        serviceAccountId: targetGroup.serviceAccountId,
        serviceGroupId: targetGroup.serviceGroupId,
        members: groupMembers,
        service: group.service,
      };
    }),
  );
  return calculateDiff(members, mappings, groupMembers, groups);
};
