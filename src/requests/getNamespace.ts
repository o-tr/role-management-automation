import { TNamespace } from "@/types/prisma";

export const getNamespaces = async (): Promise<TNamespace[]> => {
  const response = await fetch("/api/ns").then((res) => res.json());
  if (response.status === "error") {
    throw new Error(response.error);
  }
  return response.namespaces;
};
