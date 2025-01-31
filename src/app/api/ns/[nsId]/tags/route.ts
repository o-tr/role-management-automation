import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { createTag } from "@/lib/prisma/createTag";
import { getTags } from "@/lib/prisma/getTags";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import { ZColorCode } from "@/types/brand";
import type { TNamespaceId, TTag } from "@/types/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";

export type CreateTagResponse =
  | {
      status: "success";
      tag: TTag;
    }
  | ErrorResponseType;

export type GetTagsResponse =
  | {
      status: "success";
      tags: TTag[];
    }
  | ErrorResponseType;

const createTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: ZColorCode.optional(),
});

export const POST = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<CreateTagResponse> => {
    await validatePermission(params.nsId, "admin");

    const body = await req.json();
    const result = createTagSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException("Invalid request body");
    }

    const { name, color } = result.data;

    const tag = await createTag(params.nsId, { name, color });

    return {
      status: "success",
      tag,
    };
  },
);

export const GET = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetTagsResponse> => {
    await validatePermission(params.nsId, "admin");

    const tags = await getTags(params.nsId);

    return {
      status: "success",
      tags: tags,
    };
  },
);
