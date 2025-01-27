import {
  type TExternalServiceAccount,
  type TNamespaceId,
  ZExternalServiceName,
} from "@/types/prisma";
import { z } from "zod";
import { prisma } from "../prisma";
import { formatTExternalServiceAccount } from "./format/formatTExternalServiceAccount";

const ZCreateExternalServiceAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  service: ZExternalServiceName,
  credential: z.string().min(1, "Credential is required"),
});
export type TCreateExternalServiceAccountInput = z.infer<
  typeof ZCreateExternalServiceAccountSchema
>;

export type ValidatedCredential = {
  credential: string;
  icon?: string;
};

export const createExternalServiceAccount = async (
  namespaceId: TNamespaceId,
  data: TCreateExternalServiceAccountInput,
  credential: ValidatedCredential,
): Promise<TExternalServiceAccount> => {
  const serviceAccount = await prisma.externalServiceAccount.create({
    data: {
      name: data.name,
      service: data.service,
      credential: credential.credential,
      icon: credential.icon || undefined,
      namespace: { connect: { id: namespaceId } },
    },
  });

  return formatTExternalServiceAccount(serviceAccount);
};
