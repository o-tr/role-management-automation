import { api } from "@/lib/api";
import { filterFUser } from "@/lib/prisma/filter/filterFUser";
import { validatePermission } from "@/lib/validatePermission";
import type { ErrorResponseType } from "@/types/api";
import type { FUser, TNamespaceId } from "@/types/prisma";
import type { NextRequest } from "next/server";

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
    { params }: { params: { nsId: TNamespaceId } },
  ): Promise<GetAdminsResponse> => {
    const namespace = await validatePermission(params.nsId, "owner");
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
