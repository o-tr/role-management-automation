import type { CreateExternalServiceAccountResponse } from "@/app/api/ns/[nsId]/services/authentication/route";
import type { ExternalServiceName } from "@prisma/client";
import { useState } from "react";

type AuthenticationBody = {
  name: string;
  service: ExternalServiceName;
  credential: string;
};

export const useCreateServiceAuthentication = () => {
  const [loading, setLoading] = useState(false);

  const createServiceAuthentication = async (
    nsId: string,
    body: AuthenticationBody,
  ): Promise<CreateExternalServiceAccountResponse> => {
    setLoading(true);
    const response = await fetch(`/api/ns/${nsId}/services/authentication`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
    setLoading(false);
    return response;
  };

  return {
    loading,
    createServiceAuthentication,
  };
};
