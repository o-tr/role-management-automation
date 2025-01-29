import { api } from "@/lib/api";
import {
  ZCreateOrUpdateMembers,
  createOrUpdateMember,
} from "@/lib/prisma/createOrUpdateMember";
import { getMembersWithRelation } from "@/lib/prisma/getMembersWithRelation";
import { validatePermission } from "@/lib/validatePermission";
import type { TMemberWithRelation, TNamespaceId } from "@/types/prisma";
import { type NextRequest, NextResponse } from "next/server";

export type AddMembersResponse =
  | {
      status: "success";
      members: {
        id: string;
      }[];
    }
  | {
      status: "error";
      error: string;
    };

export type GetMembersResponse =
  | {
      status: "success";
      members: TMemberWithRelation[];
    }
  | {
      status: "error";
      error: string;
    };

export const POST = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<AddMembersResponse> => {
    await validatePermission(params.nsId, "admin");

    const body = ZCreateOrUpdateMembers.parse(await req.json());

    const members = await createOrUpdateMember(params.nsId, body, true);

    return {
      status: "success",
      members,
    };
  },
);

export const GET = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetMembersResponse> => {
    await validatePermission(params.nsId, "admin");

    const members = await getMembersWithRelation(params.nsId);

    return {
      status: "success",
      members,
    };
  },
);
