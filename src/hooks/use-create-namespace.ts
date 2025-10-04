import { useState } from "react";
import type { CreateNamespaceResponse } from "@/app/api/ns/route";

export const useCreateNamespace = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createNamespace = async (name: string) => {
    setIsLoading(true);
    const data = (await fetch("/api/ns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    }).then((res) => res.json())) as CreateNamespaceResponse;
    setIsLoading(false);
    return data;
  };
  return {
    isLoading,
    createNamespace,
  };
};
