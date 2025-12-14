import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteExternalServiceAccount } from "@/lib/prisma/deleteExternalServiceAccount";
import { getExternalServiceAccount } from "@/lib/prisma/getExternalServiceAccount";
import {
  updateExternalServiceAccount,
  ZUpdateExternalServiceAccountInput,
} from "@/lib/prisma/updateExternalServiceAccount";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TExternalServiceAccountId, TNamespaceId } from "@/types/prisma";

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
    _req: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        nsId: TNamespaceId;
        accountId: TExternalServiceAccountId;
      }>;
    },
  ): Promise<DeleteExternalServiceAccountResponse> => {
    const { nsId, accountId } = await params;
    await validatePermission(nsId, "owner");

    const serviceAccount = await getExternalServiceAccount(nsId, accountId);

    if (!serviceAccount) {
      throw new NotFoundException("Service account not found");
    }

    await deleteExternalServiceAccount(nsId, accountId);

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
    }: {
      params: Promise<{
        nsId: TNamespaceId;
        accountId: TExternalServiceAccountId;
      }>;
    },
  ): Promise<UpdateExternalServiceAccountResponse> => {
    const { nsId, accountId } = await params;
    await validatePermission(nsId, "owner");
    const serviceAccount = await getExternalServiceAccount(nsId, accountId);

    if (!serviceAccount) {
      throw new NotFoundException("Service account not found");
    }

    const body = await req.json();
    const result = ZUpdateExternalServiceAccountInput.safeParse(body);

    if (!result.success) {
      throw new BadRequestException("Invalid request body");
    }

    const updatedAccount = await updateExternalServiceAccount(
      nsId,
      accountId,
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
