import type { TTag } from "@/types/prisma";

export const createTag = async (
  namespaceId: string,
  name: string,
): Promise<TTag> => {
  const response = await fetch(`/api/ns/${namespaceId}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  }).then((res) => res.json());
  if (response.status === "error") {
    throw new Error(response.error);
  }
  return response.tag;
};
