import { prisma } from "@/lib/prisma";
import {
  type TMemberExternalServiceAccount,
  type TTag,
  ZExternalServiceName,
} from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type AddMembersResponse =
  | {
      status: "success";
      members: {
        id: string;
      }[];
    }
  | {
      status: "error";
      error: string;
    };

export type GetMembersResponse =
  | {
      status: "success";
      members: {
        id: string;
        tags: TTag[];
        externalAccounts: TMemberExternalServiceAccount[];
        namespaceId: string;
      }[];
    }
  | {
      status: "error";
      error: string;
    };

const memberSchema = z.object({
  services: z.array(
    z.object({
      service: ZExternalServiceName,
      serviceId: z.string(),
      serviceUsername: z.string().optional(),
      name: z.string(),
      icon: z.string().optional(),
    }),
  ),
});
const requetsBodySchema = z.array(memberSchema);
export type AddMembersBody = z.infer<typeof requetsBodySchema>;

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<AddMembersResponse>> {
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

  const body = requetsBodySchema.parse(await req.json());

  const members = await prisma.$transaction(
    body.map((member) =>
      prisma.member.create({
        data: {
          namespaceId: params.nsId,
          externalAccounts: {
            create: member.services.map((service) => ({
              namespaceId: params.nsId,
              service: service.service,
              serviceId: service.serviceId,
              serviceUsername: service.serviceUsername,
              name: service.name,
              icon: service.icon,
            })),
          },
        },
      }),
    ),
  );

  return NextResponse.json({
    status: "success",
    members,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<GetMembersResponse>> {
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

  const members = await prisma.member.findMany({
    where: {
      namespaceId: params.nsId,
    },
    include: {
      tags: true,
      externalAccounts: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    status: "success",
    members,
  });
}
