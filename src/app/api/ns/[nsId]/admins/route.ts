import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import { filterFUser } from "@/lib/prisma/filter/filterFUser";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { FUser, TNamespaceId } from "@/types/prisma";

export type AdminItem = FUser & {
  namespaceId: TNamespaceId;
  isOwner: boolean;
};

export type GetAdminsResponse =
  | {
      status: "success";
      admins: AdminItem[];
    }
  | ErrorResponseType;

export const GET = api(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ nsId: TNamespaceId }> },
  ): Promise<GetAdminsResponse> => {
    const { nsId } = await params;
    const namespace = await validatePermission(nsId, "owner");
    return {
      status: "success",
      admins: namespace.admins.map((admin) => ({
        ...filterFUser(admin),
        namespaceId: namespace.id,
        isOwner: admin.id === namespace.ownerId,
      })),
    };
  },
);
