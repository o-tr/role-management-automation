import { prisma } from "@/lib/prisma";
import { createNamespace } from "@/lib/prisma/createNamespace";
import { filterFNamespaceWithOwnerAndAdmins } from "@/lib/prisma/filter/filterFNamespaceWithOwnerAndAdmins";
import { getNamespacesWithOwnerAndAdmins } from "@/lib/prisma/getNamespacesWithOwnerAndAdmins";
import type { ErrorResponseType } from "@/types/api";
import { FNamespaceWithOwnerAndAdmins } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { NamespaceDetailResponse } from "./[nsId]/route";

export type GetNamespacesResponse =
  | {
      status: "success";
      namespaces: NamespaceDetailResponse[];
    }
  | ErrorResponseType;

export async function GET(
  req: NextRequest,
): Promise<NextResponse<GetNamespacesResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated", code: 401 },
      { status: 401 },
    );
  }

  const namespaces = (await getNamespacesWithOwnerAndAdmins(email)).map(
    (ns) => ({
      ...ns,
      isOwner: ns.owner.email === email,
    }),
  );

  return NextResponse.json({
    status: "success",
    namespaces: namespaces.map((ns) => ({
      ...filterFNamespaceWithOwnerAndAdmins(ns),
      isOwner: ns.isOwner,
    })),
  });
}

export type CreateNamespaceResponse =
  | {
      status: "success";
      namespace: NamespaceDetailResponse;
    }
  | ErrorResponseType;

const createNamespaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function POST(
  req: NextRequest,
): Promise<NextResponse<CreateNamespaceResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated", code: 401 },
      { status: 401 },
    );
  }

  const body = await req.json();
  const result = createNamespaceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { status: "error", error: result.error.errors[0].message, code: 400 },
      { status: 400 },
    );
  }

  const { name } = result.data;

  const namespace = await createNamespace(name, email);

  return NextResponse.json({
    status: "success",
    namespace: {
      ...filterFNamespaceWithOwnerAndAdmins(namespace),
      isOwner: true,
    },
  });
}
