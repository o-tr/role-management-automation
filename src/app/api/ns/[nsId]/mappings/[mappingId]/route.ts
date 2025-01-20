import { prisma } from "@/lib/prisma";
import { ZMappingAction } from "@/types/actions";
import { ZMappingCondition } from "@/types/conditions";
import type { TSerializedMapping } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type DeleteExternalServiceGroupMappingResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export type UpdateExternalServiceGroupMappingResponse =
  | {
      status: "success";
      mapping: TSerializedMapping;
    }
  | {
      status: "error";
      error: string;
    };
const updateMappingSchema = z.object({
  conditions: ZMappingCondition,
  actions: z.array(ZMappingAction),
});
export type UpdateMappingBody = z.infer<typeof updateMappingSchema>;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { nsId: string; mappingId: string } },
): Promise<NextResponse<DeleteExternalServiceGroupMappingResponse>> {
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

  const mapping = await prisma.externalServiceGroupRoleMapping.findUnique({
    where: {
      id: params.mappingId,
      namespaceId: params.nsId,
    },
  });

  if (!mapping) {
    return NextResponse.json(
      { status: "error", error: "Mapping not found" },
      { status: 404 },
    );
  }

  await prisma.externalServiceGroupRoleMapping.delete({
    where: {
      id: params.mappingId,
    },
  });

  return NextResponse.json({
    status: "success",
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { nsId: string; mappingId: string } },
): Promise<NextResponse<UpdateExternalServiceGroupMappingResponse>> {
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

  const mapping = await prisma.externalServiceGroupRoleMapping.findUnique({
    where: {
      id: params.mappingId,
      namespaceId: params.nsId,
    },
  });

  if (!mapping) {
    return NextResponse.json(
      { status: "error", error: "Mapping not found" },
      { status: 404 },
    );
  }

  const body = updateMappingSchema.parse(await req.json());

  const updatedMapping = await prisma.externalServiceGroupRoleMapping.update({
    where: {
      id: params.mappingId,
    },
    data: {
      conditions: JSON.stringify(body.conditions),
      actions: JSON.stringify(body.actions),
    },
  });

  return NextResponse.json({
    status: "success",
    mapping: updatedMapping,
  });
}
