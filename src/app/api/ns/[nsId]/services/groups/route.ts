import { api } from "@/lib/api";
import { getExternalServiceGroups } from "@/lib/prisma/getExternalServiceGroups";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";
import type { NextRequest } from "next/server";

export type GetExternalServiceGroupsResponse =
  | {
      status: "success";
      serviceGroups: TExternalServiceGroupWithAccount[];
    }
  | ErrorResponseType;

export const GET = api(
  async (
    _req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetExternalServiceGroupsResponse> => {
    await validatePermission(params.nsId, "admin");

    const serviceGroups = await getExternalServiceGroups(params.nsId);

    return {
      status: "success",
      serviceGroups,
    };
  },
);
