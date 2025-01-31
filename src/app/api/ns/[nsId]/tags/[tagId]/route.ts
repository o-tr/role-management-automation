import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteTag } from "@/lib/prisma/deleteTag";
import { getTag } from "@/lib/prisma/getTag";
import { ZUpdateTagInput, updateTag } from "@/lib/prisma/updateTag";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TNamespaceId, TTag, TTagId } from "@/types/prisma";
import { type NextRequest, NextResponse } from "next/server";

export type DeleteTagResponse =
  | {
      status: "success";
    }
  | ErrorResponseType;

export type UpdateTagResponse =
  | {
      status: "success";
      tag: TTag;
    }
  | ErrorResponseType;

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

export const PATCH = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId; tagId: TTagId } },
  ): Promise<UpdateTagResponse> => {
    await validatePermission(params.nsId, "admin");

    const tag = await getTag(params.nsId, params.tagId);

    if (!tag) {
      throw new NotFoundException("Tag not found");
    }

    const body = ZUpdateTagInput.safeParse(await req.json());
    if (!body.success) {
      throw new BadRequestException("Invalid request body");
    }

    const updated = await updateTag(params.nsId, params.tagId, {
      name: body.data.name,
      color: body.data.color,
    });

    return { status: "success", tag: updated };
  },
);
