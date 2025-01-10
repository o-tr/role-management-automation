import type { CreateExternalServiceAccountResponse } from "@/app/api/ns/[nsId]/service-accounts/route";
import type { ExternalServiceName } from "@prisma/client";
import { useState } from "react";
import { onServiceAccountChange } from "./on-accounts-change";

type AuthenticationBody = {
  name: string;
  service: ExternalServiceName;
  credential: string;
};

export const useCreateServiceAccount = () => {
  const [loading, setLoading] = useState(false);

  const createServiceAccount = async (
    nsId: string,
    body: AuthenticationBody,
  ): Promise<CreateExternalServiceAccountResponse> => {
    setLoading(true);
    const response = await fetch(`/api/ns/${nsId}/service-accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
    setLoading(false);
    onServiceAccountChange();
    return response;
  };

  return {
    loading,
    createServiceAccount,
  };
};
