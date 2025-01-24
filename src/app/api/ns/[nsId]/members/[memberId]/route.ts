import { prisma } from "@/lib/prisma";
import { type TMember, ZExternalServiceName } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type DeleteMemberResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export type UpdateMemberResponse =
  | {
      status: "success";
      member: TMember;
    }
  | {
      status: "error";
      error: string;
    };

const updateMemberSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  tags: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
      }),
    )
    .optional(),
  externalAccounts: z
    .array(
      z.object({
        memberId: z.string().optional(),
        service: ZExternalServiceName,
        serviceId: z.string(),
        serviceUsername: z.string().nullable().optional(),
        name: z.string(),
        icon: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export type UpdateMemberBody = z.infer<typeof updateMemberSchema>;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { nsId: string; memberId: string } },
): Promise<NextResponse<DeleteMemberResponse>> {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const namespace = await prisma.namespace.findUnique({
    where: { id: params.nsId },
    include: { owner: true },
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

  const member = await prisma.member.findUnique({
    where: { id: params.memberId, namespaceId: params.nsId },
  });

  if (!member) {
    return NextResponse.json(
      { status: "error", error: "Member not found" },
      { status: 404 },
    );
  }

  await prisma.$transaction([
    prisma.memberExternalServiceAccount.deleteMany({
      where: { memberId: member.id },
    }),
    prisma.member.delete({
      where: { id: member.id },
    }),
  ]);

  return NextResponse.json({ status: "success" });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { nsId: string; memberId: string } },
): Promise<NextResponse<UpdateMemberResponse>> {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const namespace = await prisma.namespace.findUnique({
    where: { id: params.nsId },
    include: { owner: true },
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

  const member = await prisma.member.findUnique({
    where: { id: params.memberId, namespaceId: params.nsId },
  });

  if (!member) {
    return NextResponse.json(
      { status: "error", error: "Member not found" },
      { status: 404 },
    );
  }

  const body = updateMemberSchema.parse(await req.json());
  console.log(
    "test",
    body.externalAccounts?.map((service) => "memberId" in service),
  );

  const [result] = await prisma.$transaction([
    prisma.member.update({
      where: { id: params.memberId },
      data: {
        tags: body.tags
          ? {
              set: body.tags.map(({ id }) => ({ id })),
            }
          : undefined,
      },
      include: { externalAccounts: true, tags: true },
    }),
    ...(body.externalAccounts?.map((service) =>
      "memberId" in service
        ? prisma.memberExternalServiceAccount.updateMany({
            where: { memberId: service.memberId, service: service.service },
            data: {
              service: service.service,
              serviceId: service.serviceId,
              serviceUsername: service.serviceUsername,
              name: service.name,
              icon: service.icon,
            },
          })
        : prisma.memberExternalServiceAccount.create({
            data: {
              namespaceId: params.nsId,
              memberId: member.id,
              service: service.service,
              serviceId: service.serviceId,
              serviceUsername: service.serviceUsername,
              name: service.name,
              icon: service.icon,
            },
          }),
    ) ?? []),
  ]);

  return NextResponse.json({
    status: "success",
    member: result,
  });
}
