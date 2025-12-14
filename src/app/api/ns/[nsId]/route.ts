import type { NextRequest } from "next/server";
import { z } from "zod";
import { api } from "@/lib/api";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { filterFNamespaceWithOwnerAndAdmins } from "@/lib/prisma/filter/filterFNamespaceWithOwnerAndAdmins";
import { updateNamespace } from "@/lib/prisma/updateNamespace";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type {
  FNamespaceWithOwnerAndAdmins,
  TNamespaceId,
} from "@/types/prisma";

export type NamespaceDetailResponse = FNamespaceWithOwnerAndAdmins & {
  isOwner: boolean;
};

export type GetNamespaceDetailResponse =
  | {
      status: "success";
      namespace: NamespaceDetailResponse;
    }
  | ErrorResponseType;

export const GET = api(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ nsId: TNamespaceId }> },
  ): Promise<GetNamespaceDetailResponse> => {
    const { nsId } = await params;
    const namespace = await validatePermission(nsId, "admin");
    return {
      status: "success",
      namespace: {
        ...filterFNamespaceWithOwnerAndAdmins(namespace),
        isOwner: namespace.isOwner,
      },
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
    { params }: { params: Promise<{ nsId: TNamespaceId }> },
  ): Promise<GetNamespaceDetailResponse> => {
    const { nsId } = await params;
    const namespace = await validatePermission(nsId, "owner");

    const body = await req.json();
    const result = patchNamespaceSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException("Invalid request body");
    }

    const { name } = result.data;

    const updatedNamespace = await updateNamespace(nsId, { name });

    return {
      status: "success",
      namespace: {
        ...updatedNamespace,
        isOwner: namespace.isOwner,
      },
    };
  },
);
