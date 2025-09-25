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
import type { NextRequest } from "next/server";

export type ToggleMappingResponse =
  | {
      status: "success";
      mapping: TSerializedMapping;
    }
  | ErrorResponseType;

export const POST = api(
  async (
    _req: NextRequest,
    { params }: { params: { nsId: TNamespaceId; mappingId: TMappingId } },
  ): Promise<ToggleMappingResponse> => {
    await validatePermission(params.nsId, "admin");

    const mapping = await getExternalServiceGroupRoleMapping(
      params.nsId,
      params.mappingId,
    );

    if (!mapping) {
      throw new NotFoundException("Mapping not found");
    }

    const updatedMapping = await updateExternalServiceGroupRoleMapping(
      params.nsId,
      params.mappingId,
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
