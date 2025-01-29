import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { updateNamespace } from "@/lib/prisma/updateNamespace";
import { validatePermission } from "@/lib/validatePermission";
import type {
  TNamespaceId,
  TNamespaceWithOwnerAndAdmins,
} from "@/types/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";

export type NamespaceDetailResponse = TNamespaceWithOwnerAndAdmins & {
  isOwner: boolean;
};

export type GetNamespaceDetailResponse =
  | {
      status: "success";
      namespace: NamespaceDetailResponse;
    }
  | {
      status: "error";
      error: string;
    };

export const GET = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetNamespaceDetailResponse> => {
    const namespace = await validatePermission(params.nsId, "admin");
    return {
      status: "success",
      namespace,
    };
  },
);

export type PatchNamespaceDetailBody = {
  name: string;
};

const patchNamespaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const PATCH = api(
  async (
    req: NextRequest,
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetNamespaceDetailResponse> => {
    const namespace = await validatePermission(params.nsId, "admin");

    const body = await req.json();
    const result = patchNamespaceSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException("Invalid request body");
    }

    const { name } = result.data;

    const updatedNamespace = await updateNamespace(params.nsId, name);

    return {
      status: "success",
      namespace: {
        ...updatedNamespace,
        isOwner: namespace.isOwner,
      },
    };
  },
);
