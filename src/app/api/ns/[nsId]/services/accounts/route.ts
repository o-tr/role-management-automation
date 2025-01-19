import { prisma } from "@/lib/prisma";
import { type TServiceAccount, ZExternalServiceName } from "@/types/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCredential } from "./validation";

export type CreateExternalServiceAccountResponse =
  | {
      status: "success";
      serviceAccount: {
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

export type GetExternalServiceAccountsResponse =
  | {
      status: "success";
      serviceAccounts: TServiceAccount[];
    }
  | {
      status: "error";
      error: string;
    };

const createServiceAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  service: ZExternalServiceName,
  credential: z.string().min(1, "Credential is required"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<GetExternalServiceAccountsResponse>> {
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

  const serviceAccounts = (
    await prisma.externalServiceAccount.findMany({
      where: {
        namespaceId: params.nsId,
      },
      select: {
        id: true,
        name: true,
        service: true,
        icon: true,
      },
    })
  ).map((serviceAccount) => ({
    ...serviceAccount,
    icon: serviceAccount.icon || undefined,
    credential: undefined,
  }));

  return NextResponse.json({
    status: "success",
    serviceAccounts,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<CreateExternalServiceAccountResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const result = createServiceAccountSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { status: "error", error: result.error.errors[0].message },
      { status: 400 },
    );
  }

  const { name, service, credential } = result.data;

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

  const validatedCredential = await validateCredential(service, credential);

  if (!validatedCredential) {
    return NextResponse.json(
      { status: "error", error: "Invalid credential" },
      { status: 400 },
    );
  }

  const serviceAccount = await prisma.externalServiceAccount.create({
    data: {
      name,
      service,
      credential: validatedCredential.credential,
      icon: validatedCredential.icon || undefined,
      namespace: { connect: { id: params.nsId } },
    },
  });

  return NextResponse.json({
    status: "success",
    serviceAccount: {
      id: serviceAccount.id,
      name: serviceAccount.name,
      service: serviceAccount.service,
      icon: serviceAccount.icon || undefined,
    },
  });
}
