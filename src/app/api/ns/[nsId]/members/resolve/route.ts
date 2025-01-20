import { getUser } from "@/lib/discord/requests/getUser";
import { prisma } from "@/lib/prisma";
import { getUserById } from "@/lib/vrchat/requests/getUserById";
import type { VRCUserId } from "@/lib/vrchat/types/brand";
import { ZDiscordCredentials, ZVRChatCredentials } from "@/types/credentials";
import { ZExternalServiceName } from "@/types/prisma";
import type {
  ExternalServiceAccount,
  ExternalServiceName,
} from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const resolveRequestItem = z.object({
  service: ZExternalServiceName,
  serviceId: z.string(),
});

type ResolveResponseItem = {
  service: ExternalServiceName;
  serviceId: string;
  name: string;
  icon?: string;
};

export type ResolveResponse =
  | {
      status: "success";
      item: ResolveResponseItem;
    }
  | {
      status: "error";
      error: string;
    };

export async function POST(
  req: NextRequest,
  { params }: { params: { nsId: string } },
): Promise<NextResponse<ResolveResponse>> {
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

  const body = resolveRequestItem.parse(await req.json());
  const item = await resolve(body.service, body.serviceId, params.nsId);

  return NextResponse.json({
    status: "success",
    item: {
      ...body,
      ...item,
    },
  });
}

const resolve = async (
  service: ExternalServiceName,
  serviceId: string,
  nsId: string,
) => {
  const serviceAccount = await prisma.externalServiceAccount.findFirst({
    where: {
      service,
      namespaceId: nsId,
    },
  });
  if (!serviceAccount) {
    throw new Error(`Service account not found: ${service}`);
  }
  switch (service) {
    case "VRCHAT":
      return resolveVRChat(serviceId, serviceAccount);
    case "DISCORD":
      return resolveDiscord(serviceId, serviceAccount);
    default:
      throw new Error(`Unsupported service: ${service}`);
  }
};

const resolveVRChat = async (
  serviceId: string,
  serviceAccount: ExternalServiceAccount,
) => {
  const data = ZVRChatCredentials.parse(JSON.parse(serviceAccount.credential));
  const user = await getUserById(
    data.token,
    data.twoFactorToken,
    serviceId as VRCUserId,
  );

  return {
    name: user.name,
    icon:
      user.profilePicOverrideThumbnail || user.currentAvatarThumbnailImageUrl,
  };
};

const resolveDiscord = async (
  serviceId: string,
  serviceAccount: ExternalServiceAccount,
) => {
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const user = await getUser(data.token, serviceId);
  return {
    name: user.username,
    icon: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : undefined,
  };
};
