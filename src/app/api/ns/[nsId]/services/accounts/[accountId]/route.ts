import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteExternalServiceAccount } from "@/lib/prisma/deleteExternalServiceAccount";
import { getExternalServiceAccount } from "@/lib/prisma/getExternalServiceAccount";
import {
  ZUpdateExternalServiceAccountInput,
  updateExternalServiceAccount,
} from "@/lib/prisma/updateExternalServiceAccount";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TExternalServiceAccountId, TNamespaceId } from "@/types/prisma";
import type { NextRequest } from "next/server";

export type DeleteExternalServiceAccountResponse =
  | {
      status: "success";
    }
  | ErrorResponseType;

export type UpdateExternalServiceAccountResponse =
  | {
      status: "success";
      account: {
        id: string;
        name: string;
        service: string;
        icon?: string;
      };
    }
  | ErrorResponseType;

export const DELETE = api(
  async (
    req: NextRequest,
    {
      params,
    }: { params: { nsId: TNamespaceId; accountId: TExternalServiceAccountId } },
  ): Promise<DeleteExternalServiceAccountResponse> => {
    await validatePermission(params.nsId, "owner");

    const serviceAccount = await getExternalServiceAccount(
      params.nsId,
      params.accountId,
    );

    if (!serviceAccount) {
      throw new NotFoundException("Service account not found");
    }

    await deleteExternalServiceAccount(params.nsId, params.accountId);

    return {
      status: "success",
    };
  },
);

export const PATCH = api(
  async (
    req: NextRequest,
    {
      params,
    }: { params: { nsId: TNamespaceId; accountId: TExternalServiceAccountId } },
  ): Promise<UpdateExternalServiceAccountResponse> => {
    await validatePermission(params.nsId, "owner");
    const serviceAccount = await getExternalServiceAccount(
      params.nsId,
      params.accountId,
    );

    if (!serviceAccount) {
      throw new NotFoundException("Service account not found");
    }

    const body = await req.json();
    const result = ZUpdateExternalServiceAccountInput.safeParse(body);

    if (!result.success) {
      throw new BadRequestException("Invalid request body");
    }

    const updatedAccount = await updateExternalServiceAccount(
      params.nsId,
      params.accountId,
      result.data,
    );

    return {
      status: "success",
      account: {
        id: updatedAccount.id,
        name: updatedAccount.name,
        service: updatedAccount.service,
        icon: updatedAccount.icon || undefined,
      },
    };
  },
);
