import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type GetNamespacesResponse =
  | {
      status: "success";
      namespaces: {
        id: string;
        name: string;
        isOwner: boolean;
      }[];
    }
  | {
      status: "error";
      error: string;
    };

export async function GET(
  req: NextRequest,
): Promise<NextResponse<GetNamespacesResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const namespaces = (
    await prisma.namespace.findMany({
      where: {
        admins: {
          some: {
            email: email,
          },
        },
      },
      select: {
        id: true,
        name: true,
        owner: true,
      },
    })
  ).map((ns) => {
    return {
      id: ns.id,
      name: ns.name,
      isOwner: ns.owner.email === email,
    };
  });

  return NextResponse.json({
    status: "success",
    namespaces,
  });
}

export type CreateNamespaceResponse =
  | {
      status: "success";
      namespace: {
        id: string;
        name: string;
        isOwner: boolean;
      };
    }
  | {
      status: "error";
      error: string;
    };

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
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const result = createNamespaceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { status: "error", error: result.error.errors[0].message },
      { status: 400 },
    );
  }

  const { name } = result.data;

  const namespace = await prisma.namespace.create({
    data: {
      name,
      owner: { connect: { email } },
      admins: { connect: { email } },
    },
  });

  return NextResponse.json({
    status: "success",
    namespace: {
      id: namespace.id,
      name: namespace.name,
      isOwner: true,
    },
  });
}
