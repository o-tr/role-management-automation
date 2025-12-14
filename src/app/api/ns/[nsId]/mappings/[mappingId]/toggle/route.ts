import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { getExternalServiceGroupRoleMapping } from "@/lib/prisma/getExternalServiceGroupRoleMapping";
import { updateExternalServiceGroupRoleMapping } from "@/lib/prisma/updateExternalServiceGroupRoleMapping";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TMappingId,
  TNamespaceId,
  TSerializedMapping,
} from "@/types/prisma";

export type ToggleMappingResponse =
  | {
      status: "success";
      mapping: TSerializedMapping;
    }
  | ErrorResponseType;

export const POST = api(
  async (
    _req: NextRequest,
    {
      params,
    }: { params: Promise<{ nsId: TNamespaceId; mappingId: TMappingId }> },
  ): Promise<ToggleMappingResponse> => {
    const { nsId, mappingId } = await params;
    await validatePermission(nsId, "admin");

    const mapping = await getExternalServiceGroupRoleMapping(nsId, mappingId);

    if (!mapping) {
      throw new NotFoundException("Mapping not found");
    }

    const updatedMapping = await updateExternalServiceGroupRoleMapping(
      nsId,
      mappingId,
      {
        enabled: !mapping.enabled,
      },
    );

    return {
      status: "success",
      mapping: updatedMapping,
    };
  },
);
