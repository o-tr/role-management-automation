import { z } from "zod";
import type {
  TExternalServiceAccount,
  TExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTExternalServiceAccount } from "./format/formatTExternalServiceAccount";

export const ZUpdateExternalServiceAccountInput = z.object({
  name: z.string().min(1, "Name is required").optional(),
});
export type UpdateExternalServiceAccountInput = z.infer<
  typeof ZUpdateExternalServiceAccountInput
>;

export const updateExternalServiceAccount = async (
  namespaceId: TNamespaceId,
  accountId: TExternalServiceAccountId,
  data: UpdateExternalServiceAccountInput,
): Promise<TExternalServiceAccount> => {
  const result = await prisma.externalServiceAccount.update({
    where: {
      namespaceId: namespaceId,
      id: accountId,
    },
    data: {
      name: data.name,
    },
  });
  return formatTExternalServiceAccount(result);
};
