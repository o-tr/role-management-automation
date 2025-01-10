import { prisma } from "@/lib/prisma";
import type { TNamespaceDetail } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type GetNamespaceDetailResponse =
  | {
      status: "success";
      namespace: TNamespaceDetail;
    }
  | {
      status: "error";
      error: string;
    };

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<GetNamespaceDetailResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const namespace = await prisma.namespace.findUnique({
    where: {
      id: params.nsId,
    },
    include: {
      owner: true,
      admins: true,
      members: true,
      tags: true,
    },
  });

  if (!namespace) {
    return NextResponse.json(
      { status: "error", error: "Namespace not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: "success",
    namespace: {
      id: namespace.id,
      name: namespace.name,
      owner: {
        id: namespace.owner.id,
        name: namespace.owner.name,
        email: namespace.owner.email,
      },
      admins: namespace.admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
      })),
      members: namespace.members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
      })),
      tags: namespace.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
      isOwner: namespace.owner.email === email,
    },
  });
}

export type PatchNamespaceDetailBody = {
  name: string;
};

const patchNamespaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<GetNamespaceDetailResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const result = patchNamespaceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { status: "error", error: result.error.errors[0].message },
      { status: 400 },
    );
  }

  const { name } = result.data;

  const namespace = await prisma.namespace.findUnique({
    where: {
      id: params.nsId,
    },
    include: {
      owner: true,
      admins: true,
      members: true,
      tags: true,
    },
  });

  if (!namespace) {
    return NextResponse.json(
      { status: "error", error: "Namespace not found" },
      { status: 404 },
    );
  }

  if (namespace.owner.email !== email) {
    return NextResponse.json(
      { status: "error", error: "Not authorized" },
      { status: 403 },
    );
  }

  const updatedNamespace = await prisma.namespace.update({
    where: {
      id: params.nsId,
    },
    data: {
      name: name,
    },
    include: {
      owner: true,
      admins: true,
      members: true,
      tags: true,
    },
  });

  return NextResponse.json({
    status: "success",
    namespace: {
      id: updatedNamespace.id,
      name: updatedNamespace.name,
      owner: {
        id: updatedNamespace.owner.id,
        name: updatedNamespace.owner.name,
        email: updatedNamespace.owner.email,
      },
      admins: updatedNamespace.admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
      })),
      members: updatedNamespace.members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
      })),
      tags: updatedNamespace.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
      isOwner: updatedNamespace.owner.email === email,
    },
  });
}
