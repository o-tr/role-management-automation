import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type DeleteExternalServiceAccountResponse =
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

export type UpdateExternalServiceAccountResponse =
  | {
      status: "success";
      account: {
        id: string;
        name: string;
        service: string;
        icon?: string;
      };
    }
  | {
      status: "error";
      error: string;
    };

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { nsId: string; accountId: string } },
): Promise<NextResponse<DeleteExternalServiceAccountResponse>> {
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

  const serviceAccount = await prisma.externalServiceAccount.findUnique({
    where: {
      id: params.accountId,
      namespaceId: params.nsId,
    },
  });

  if (!serviceAccount) {
    return NextResponse.json(
      { status: "error", error: "Service account not found" },
      { status: 404 },
    );
  }

  await prisma.externalServiceAccount.delete({
    where: {
      id: params.accountId,
    },
  });

  return NextResponse.json({
    status: "success",
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { nsId: string; accountId: string } },
): Promise<NextResponse<UpdateExternalServiceAccountResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const result = updateAccountSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        status: "error",
        error: result.error.errors.map((e) => e.message).join(", "),
      },
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

  const serviceAccount = await prisma.externalServiceAccount.findUnique({
    where: {
      id: params.accountId,
      namespaceId: params.nsId,
    },
  });

  if (!serviceAccount) {
    return NextResponse.json(
      { status: "error", error: "Service account not found" },
      { status: 404 },
    );
  }

  const updatedAccount = await prisma.externalServiceAccount.update({
    where: {
      id: params.accountId,
    },
    data: {
      name,
    },
  });

  return NextResponse.json({
    status: "success",
    account: {
      id: updatedAccount.id,
      name: updatedAccount.name,
      service: updatedAccount.service,
      icon: updatedAccount.icon || undefined,
    },
  });
}
