import type {
  FExternalServiceAccount,
  TExternalServiceAccount,
} from "@/types/prisma";

export const filterFExternalServiceAccount = (
  data: TExternalServiceAccount,
): FExternalServiceAccount => {
  return {
    id: data.id,
    name: data.name,
    service: data.service,
    icon: data.icon,
    namespaceId: data.namespaceId,
  };
};
