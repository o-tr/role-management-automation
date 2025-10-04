import type { NextRequest } from "next/server";
import { z } from "zod";
import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteExternalServiceGroupRoleMapping } from "@/lib/prisma/deleteExternalServiceGroupRoleMapping";
import { getExternalServiceGroupRoleMapping } from "@/lib/prisma/getExternalServiceGroupRoleMapping";
import { updateExternalServiceGroupRoleMapping } from "@/lib/prisma/updateExternalServiceGroupRoleMapping";
import { validatePermission } from "@/lib/validatePermission";
import { ZMappingAction } from "@/types/actions";
import type { ErrorResponseType } from "@/types/api";
import { ZMappingCondition } from "@/types/conditions";
import type {
  TMappingId,
  TNamespaceId,
  TSerializedMapping,
} from "@/types/prisma";

export type DeleteExternalServiceGroupMappingResponse =
  | {
      status: "success";
    }
  | ErrorResponseType;

export type UpdateExternalServiceGroupMappingResponse =
  | {
      status: "success";
      mapping: TSerializedMapping;
    }
  | ErrorResponseType;
const updateMappingSchema = z.object({
  conditions: ZMappingCondition.optional(),
  actions: z.array(ZMappingAction).optional(),
  enabled: z.boolean().optional(),
});
export type UpdateMappingBody = z.infer<typeof updateMappingSchema>;

export const DELETE = api(
  async (
    _req: NextRequest,
    { params }: { params: { nsId: TNamespaceId; mappingId: TMappingId } },
  ): Promise<DeleteExternalServiceGroupMappingResponse> => {
    await validatePermission(params.nsId, "admin");

    const mapping = await getExternalServiceGroupRoleMapping(
      params.nsId,
      params.mappingId,
    );

    if (!mapping) {
      throw new NotFoundException("Mapping not found");
    }

    await deleteExternalServiceGroupRoleMapping(params.nsId, params.mappingId);

    return {
      status: "success",
    };
  },
);

export const PATCH = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId; mappingId: TMappingId } },
  ): Promise<UpdateExternalServiceGroupMappingResponse> => {
    validatePermission(params.nsId, "admin");

    const mapping = await getExternalServiceGroupRoleMapping(
      params.nsId,
      params.mappingId,
    );

    if (!mapping) {
      throw new NotFoundException("Mapping not found");
    }

    const body = updateMappingSchema.parse(await req.json());

    const updatedMapping = await updateExternalServiceGroupRoleMapping(
      params.nsId,
      params.mappingId,
      body,
    );

    return {
      status: "success",
      mapping: updatedMapping,
    };
  },
);
