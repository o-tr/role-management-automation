import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { prisma } from "@/lib/prisma";
import { createTag } from "@/lib/prisma/createTag";
import { formatTTag } from "@/lib/prisma/format/formatTTag";
import { getTags } from "@/lib/prisma/getTags";
import { validatePermission } from "@/lib/validatePermission";
import type { TNamespaceId, TTag } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type CreateTagResponse =
  | {
      status: "success";
      tag: TTag;
    }
  | {
      status: "error";
      error: string;
    };

export type GetTagsResponse =
  | {
      status: "success";
      tags: TTag[];
    }
  | {
      status: "error";
      error: string;
    };

const createTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
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

    const { name } = result.data;

    const tag = await createTag(params.nsId, { name });

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
