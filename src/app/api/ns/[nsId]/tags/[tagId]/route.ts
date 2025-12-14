import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { deleteTag } from "@/lib/prisma/deleteTag";
import { getTag } from "@/lib/prisma/getTag";
import { updateTag, ZUpdateTagInput } from "@/lib/prisma/updateTag";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { TNamespaceId, TTag, TTagId } from "@/types/prisma";

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
    _req: NextRequest,
    { params }: { params: Promise<{ nsId: TNamespaceId; tagId: TTagId }> },
  ): Promise<DeleteTagResponse> => {
    const { nsId, tagId } = await params;
    await validatePermission(nsId, "admin");
    const tag = await getTag(nsId, tagId);

    if (!tag) {
      throw new NotFoundException("Tag not found");
    }

    await deleteTag(nsId, tagId);

    return { status: "success" };
  },
);

export const PATCH = api(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ nsId: TNamespaceId; tagId: TTagId }> },
  ): Promise<UpdateTagResponse> => {
    const { nsId, tagId } = await params;
    await validatePermission(nsId, "admin");

    const tag = await getTag(nsId, tagId);
    if (!tag) {
      throw new NotFoundException("Tag not found");
    }

    const body = ZUpdateTagInput.safeParse(await req.json());
    if (!body.success) {
      throw new BadRequestException("Invalid request body");
    }

    const updated = await updateTag(nsId, tagId, {
      name: body.data.name,
      color: body.data.color,
    });

    return { status: "success", tag: updated };
  },
);
