import type { DeleteMemberResponse } from "@/app/api/ns/[nsId]/members/[memberId]/route";

export const deleteMember = async (
  nsId: string,
  memberId: string,
): Promise<DeleteMemberResponse> => {
  const response = await fetch(`/api/ns/${nsId}/members/${memberId}`, {
    method: "DELETE",
  }).then((res) => res.json());
  return response;
};
