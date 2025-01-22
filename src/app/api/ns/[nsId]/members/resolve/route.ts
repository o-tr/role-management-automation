import { getSearchGuildMembers } from "@/lib/discord/requests/getSerachGUildMembers";
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

export const ZResolveRequestType = z.union([
  z.literal("DiscordUserId"),
  z.literal("DiscordUsername"),
  z.literal("VRCUserId"),
  z.literal("GitHubUserId"),
  z.literal("GitHubUsername"),
]);
export type TResolveRequestType = z.infer<typeof ZResolveRequestType>;

const resolveRequestItem = z.object({
  type: ZResolveRequestType,
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
  const item = await resolve(body.type, body.serviceId, params.nsId);

  return NextResponse.json({
    status: "success",
    item: {
      ...body,
      ...item,
    },
  });
}

const resolve = async (
  type: TResolveRequestType,
  serviceId: string,
  nsId: string,
) => {
  const service = requestType2Service(type);
  const serviceAccount = await prisma.externalServiceAccount.findFirst({
    where: {
      service,
      namespaceId: nsId,
    },
  });
  if (!serviceAccount) {
    throw new Error(`Service account not found: ${service}`);
  }
  switch (type) {
    case "VRCUserId":
      return resolveVRCUserId(serviceId, serviceAccount);
    case "DiscordUserId":
      return resolveDiscordUserId(serviceId, serviceAccount);
    case "DiscordUsername":
      return resolveDiscordUserName(serviceId, serviceAccount);
    default:
      throw new Error(`Unsupported service: ${service}`);
  }
};

const resolveVRCUserId = async (
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
    service: "VRCHAT" as ExternalServiceName,
  };
};

const resolveDiscordUserId = async (
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
    service: "DISCORD" as ExternalServiceName,
  };
};

const resolveDiscordUserName = async (
  serviceId: string,
  serviceAccount: ExternalServiceAccount,
) => {
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const guilds = await prisma.externalServiceGroup.findMany({
    where: {
      accountId: serviceAccount.id,
    },
  });
  for (const guild of guilds) {
    const members = await getSearchGuildMembers(
      data.token,
      serviceId,
      guild.id,
    );
    if (!members?.[0]) continue;
    const { user } = members[0];
    return {
      name: user.username,
      icon: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : undefined,
      service: "DISCORD" as ExternalServiceName,
    };
  }
  throw new Error("User not found");
};

const requestType2Service = (
  type: TResolveRequestType,
): ExternalServiceName => {
  switch (type) {
    case "DiscordUserId":
    case "DiscordUsername":
      return "DISCORD";
    case "VRCUserId":
      return "VRCHAT";
    case "GitHubUserId":
    case "GitHubUsername":
      return "GITHUB";
  }
};
