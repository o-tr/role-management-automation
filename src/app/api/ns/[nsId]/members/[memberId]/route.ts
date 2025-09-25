import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteMember } from "@/lib/prisma/deleteMember";
import { getMember } from "@/lib/prisma/getMember";
import { updateMember, ZMemberUpdateInput } from "@/lib/prisma/updateMember";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  TMemberId,
  TMemberWithRelation,
  TNamespaceId,
} from "@/types/prisma";

export type DeleteMemberResponse =
  | {
      status: "success";
    }
  | ErrorResponseType;

export type UpdateMemberResponse =
  | {
      status: "success";
      member: TMemberWithRelation;
    }
  | ErrorResponseType;

export const DELETE = api(
  async (
    _req: NextRequest,
    { params }: { params: { nsId: TNamespaceId; memberId: TMemberId } },
  ): Promise<DeleteMemberResponse> => {
    await validatePermission(params.nsId, "admin");

    const member = await getMember(params.nsId, params.memberId);

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    await deleteMember(params.nsId, params.memberId);

    return { status: "success" };
  },
);

export const PATCH = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId; memberId: TMemberId } },
  ): Promise<UpdateMemberResponse> => {
    await validatePermission(params.nsId, "admin");

    const member = await getMember(params.nsId, params.memberId);

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    const body = ZMemberUpdateInput.parse(await req.json());

    const result = await updateMember(params.nsId, params.memberId, body);
    return {
      status: "success",
      member: result,
    };
  },
);
