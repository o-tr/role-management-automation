import { api } from "@/lib/api";
import { filterFUser } from "@/lib/prisma/filter/filterFUser";
import { validatePermission } from "@/lib/validatePermission";
import { type FUser, type TNamespaceId, TUser } from "@/types/prisma";
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
  | {
      status: "error";
      error: string;
    };

export const GET = api(
  async (
    req: NextRequest,
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
