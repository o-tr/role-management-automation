import { useState } from "react";

export const useSetNamespaceName = (nsId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const setNamespaceName = async (name: string) => {
    setIsLoading(true);
    await fetch(`/api/ns/${nsId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    setIsLoading(false);
  };
  return {
    isLoading,
    setNamespaceName,
  };
};
