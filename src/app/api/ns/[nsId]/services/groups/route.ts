import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { getExternalServiceGroups } from "@/lib/prisma/getExternalServiceGroups";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";

export type GetExternalServiceGroupsResponse =
  | {
      status: "success";
      serviceGroups: TExternalServiceGroupWithAccount[];
    }
  | ErrorResponseType;

export const GET = api(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ nsId: TNamespaceId }> },
  ): Promise<GetExternalServiceGroupsResponse> => {
    const { nsId } = await params;
    await validatePermission(nsId, "admin");

    const serviceGroups = await getExternalServiceGroups(nsId);
    return {
      status: "success",
      serviceGroups,
    };
  },
);
