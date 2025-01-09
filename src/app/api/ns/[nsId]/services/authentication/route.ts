import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { validateCredential } from "./validation";

export type CreateExternalServiceAccountResponse =
  | {
      status: "success";
      serviceAccount: {
        id: string;
        name: string;
        service: string;
        credential: string;
        icon?: string;
      };
    }
  | {
      status: "error";
      error: string;
    };

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: string } }
): Promise<NextResponse<CreateExternalServiceAccountResponse>> {
  const session = await getServerSession();

  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { status: "error", error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { name, service, credential, icon } = await req.json();

  if (!name || !service || !credential) {
    return NextResponse.json(
      { status: "error", error: "Name, service, and credential are required" },
      { status: 400 }
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
      { status: 404 }
    );
  }

  if (namespace.owner.email !== email) {
    return NextResponse.json(
      { status: "error", error: "Not authorized" },
      { status: 403 }
    );
  }

  if (!await validateCredential(service, credential)){
    return NextResponse.json(
      { status: "error", error: "Invalid credential" },
      { status: 400 }
    );
  }

  const serviceAccount = await prisma.externalServiceAccount.create({
    data: {
      name,
      service,
      credential,
      icon,
      namespace: { connect: { id: params.nsId } },
    },
  });

  return NextResponse.json({
    status: "success",
    serviceAccount: {
      id: serviceAccount.id,
      name: serviceAccount.name,
      service: serviceAccount.service,
      credential: serviceAccount.credential,
      icon: serviceAccount.icon || undefined,
    },
  });
}
