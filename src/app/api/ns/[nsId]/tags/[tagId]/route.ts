import { api } from "@/lib/api";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteTag } from "@/lib/prisma/deleteTag";
import { getTag } from "@/lib/prisma/getTag";
import { validatePermission } from "@/lib/validatePermission";
import type { TNamespaceId, TTagId } from "@/types/prisma";
import { type NextRequest, NextResponse } from "next/server";

export type DeleteTagResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export const DELETE = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId; tagId: TTagId } },
  ): Promise<DeleteTagResponse> => {
    await validatePermission(params.nsId, "admin");

    const tag = await getTag(params.nsId, params.tagId);

    if (!tag) {
      throw new NotFoundException("Tag not found");
    }

    await deleteTag(params.nsId, params.tagId);

    return { status: "success" };
  },
);
