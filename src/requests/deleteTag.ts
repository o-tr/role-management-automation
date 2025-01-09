import type { DeleteTagResponse } from "@/app/api/ns/[nsId]/tags/[tagId]/route";

export const deleteTag = async (
  namespaceId: string,
  tagId: string,
): Promise<void> => {
  const response = (await fetch(`/api/ns/${namespaceId}/tags/${tagId}`, {
    method: "DELETE",
  }).then((res) => res.json())) as DeleteTagResponse;
  if (response.status === "error") {
    throw new Error(response.error);
  }
};
