import type { ExternalServiceName } from "@prisma/client";
import { useState } from "react";
import type { CreateExternalServiceAccountResponse } from "@/app/api/ns/[nsId]/services/accounts/route";
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
    try {
      const response = (await fetch(`/api/ns/${nsId}/services/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then((res) => res.json())) as CreateExternalServiceAccountResponse;
      if (response.status === "error") {
        throw new Error(response.error);
      }
      onServiceAccountChange();
      return response;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createServiceAccount,
  };
};
