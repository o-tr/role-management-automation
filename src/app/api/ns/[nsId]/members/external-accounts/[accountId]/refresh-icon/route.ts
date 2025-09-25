import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { getExternalServiceAccountByServiceName } from "@/lib/prisma/getExternalServiceAccountByServiceName";
import { getMemberExternalServiceAccountById } from "@/lib/prisma/getMemberExternalServiceAccountById";
import { updateMemberExternalServiceAccountIcon } from "@/lib/prisma/updateMemberExternalServiceAccountIcon";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TMemberExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import { refreshExternalServiceAccountIcon } from "./refresh-external-service-icon";

export type RefreshMemberExternalAccountIconResponse =
  | {
      status: "success";
      icon?: string;
    }
  | ErrorResponseType;

export const POST = api(
  async (
    _req: NextRequest,
    {
      params,
    }: {
      params: {
        nsId: TNamespaceId;
        accountId: TMemberExternalServiceAccountId;
      };
    },
  ): Promise<RefreshMemberExternalAccountIconResponse> => {
    await validatePermission(params.nsId, "admin");

    const memberExternalAccount = await getMemberExternalServiceAccountById(
      params.nsId,
      params.accountId,
    );

    if (!memberExternalAccount) {
      throw new NotFoundException("Member external account not found");
    }

    const serviceAccount = await getExternalServiceAccountByServiceName(
      params.nsId,
      memberExternalAccount.service,
    );

    if (!serviceAccount) {
      throw new BadRequestException(
        `No service account found for ${memberExternalAccount.service}`,
      );
    }

    try {
      const newIcon = await refreshExternalServiceAccountIcon(
        serviceAccount,
        memberExternalAccount,
      );

      // Update the member external account with the new icon
      await updateMemberExternalServiceAccountIcon(
        params.nsId,
        params.accountId,
        newIcon,
      );

      return {
        status: "success",
        icon: newIcon,
      };
    } catch (error) {
      console.error("Failed to refresh icon:", error);
      throw new BadRequestException(
        "Failed to refresh icon from external service",
      );
    }
  },
);
