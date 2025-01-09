import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";

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

  const { name } = await req.json();

  if (!name) {
    return NextResponse.json(
      { status: "error", error: "Name is required" },
      { status: 400 },
    );
  }

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
