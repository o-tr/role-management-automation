import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { getExternalServiceAccount } from "@/lib/prisma/getExternalServiceAccount";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TAvailableGroup,
  TExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import { getAvailableGroups } from "./get-available-groups";

export type GetAvailableGroupsResponse =
  | {
      status: "success";
      groups: TAvailableGroup[];
    }
  | ErrorResponseType;

export const GET = api(
  async (
    _req: NextRequest,
    {
      params,
    }: { params: { nsId: TNamespaceId; accountId: TExternalServiceAccountId } },
  ): Promise<GetAvailableGroupsResponse> => {
    await validatePermission(params.nsId, "owner");

    const serviceAccount = await getExternalServiceAccount(
      params.nsId,
      params.accountId,
    );

    if (!serviceAccount) {
      throw new NotFoundException("Service account not found");
    }

    const groups = await getAvailableGroups(serviceAccount);

    return { status: "success", groups };
  },
);
