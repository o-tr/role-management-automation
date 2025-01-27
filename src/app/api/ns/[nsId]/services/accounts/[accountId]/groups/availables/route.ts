import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { getExternalServiceAccount } from "@/lib/prisma/getExternalServiceAccount";
import { validatePermission } from "@/lib/validatePermission";
import type {
  TAvailableGroup,
  TExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import type { NextRequest } from "next/server";
import { getAvailableGroups } from "./get-available-groups";

export type GetAvailableGroupsResponse =
  | {
      status: "success";
      groups: TAvailableGroup[];
    }
  | {
      status: "error";
      error: string;
    };

export const GET = api(
  async (
    req: NextRequest,
    {
      params,
    }: { params: { nsId: TNamespaceId; accountId: TExternalServiceAccountId } },
  ): Promise<GetAvailableGroupsResponse> => {
    await validatePermission(params.nsId, "admin");

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
