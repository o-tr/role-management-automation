import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { createExternalServiceAccount } from "@/lib/prisma/createExternalServiceAccount";
import { filterFExternalServiceAccount } from "@/lib/prisma/filter/filterFExternalServiceAccount";
import { getExternalServiceAccounts } from "@/lib/prisma/getExternalServiceAccounts";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import {
  type FExternalServiceAccount,
  type TNamespaceId,
  ZExternalServiceName,
} from "@/types/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { validateCredential } from "./validation";

export type CreateExternalServiceAccountResponse =
  | {
      status: "success";
      serviceAccount: {
        id: string;
        name: string;
        service: string;
        icon?: string;
      };
    }
  | ErrorResponseType;

export type GetExternalServiceAccountsResponse =
  | {
      status: "success";
      serviceAccounts: FExternalServiceAccount[];
    }
  | ErrorResponseType;

const createServiceAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  service: ZExternalServiceName,
  credential: z.string().min(1, "Credential is required"),
});

export const GET = api(
  async (
    _req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetExternalServiceAccountsResponse> => {
    await validatePermission(params.nsId, "admin");

    const serviceAccounts = (await getExternalServiceAccounts(params.nsId)).map(
      filterFExternalServiceAccount,
    );

    return {
      status: "success",
      serviceAccounts,
    };
  },
);

export const POST = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<CreateExternalServiceAccountResponse> => {
    await validatePermission(params.nsId, "owner");

    const body = await req.json();
    const result = createServiceAccountSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException("Invalid request body");
    }

    const { name, service, credential } = result.data;
    const validatedCredential = await validateCredential(service, credential);

    if (!validatedCredential) {
      throw new BadRequestException("Invalid credential");
    }

    const serviceAccount = await createExternalServiceAccount(
      params.nsId,
      { name, service, credential },
      validatedCredential,
    );

    return {
      status: "success",
      serviceAccount: {
        id: serviceAccount.id,
        name: serviceAccount.name,
        service: serviceAccount.service,
        icon: serviceAccount.icon || undefined,
      },
    };
  },
);
