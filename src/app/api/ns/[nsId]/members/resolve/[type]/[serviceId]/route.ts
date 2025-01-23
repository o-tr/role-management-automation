import { getSearchGuildMembers } from "@/lib/discord/requests/getSerachGUildMembers";
import { getUser } from "@/lib/discord/requests/getUser";
import { prisma } from "@/lib/prisma";
import { getUserById } from "@/lib/vrchat/requests/getUserById";
import type { VRCUserId } from "@/lib/vrchat/types/brand";
import { ZDiscordCredentials, ZVRChatCredentials } from "@/types/credentials";
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

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: string; type: string; serviceId: string } },
): Promise<NextResponse<ResolveResponse>> {
  const type = ZResolveRequestType.parse(params.type);
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

  const item = await resolve(type, params.serviceId, params.nsId);

  return NextResponse.json({
    status: "success",
    item: {
      ...item,
      serviceId: params.serviceId,
    },
  });
}

const resolve = async (
  type: TResolveRequestType,
  serviceId: string,
  nsId: string,
): Promise<{
  name: string;
  icon?: string;
  service: ExternalServiceName;
}> => {
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
): Promise<{
  name: string;
  icon?: string;
  service: ExternalServiceName;
}> => {
  const member = await prisma.memberExternalServiceAccount.findFirst({
    where: {
      service: "VRCHAT",
      serviceId: serviceId,
      namespaceId: serviceAccount.namespaceId,
    },
  });
  if (member) {
    return {
      name: member.name,
      icon: member.icon || undefined,
      service: "VRCHAT" as ExternalServiceName,
    };
  }
  const user = await getUserById(serviceAccount, serviceId as VRCUserId);

  return {
    name: user.displayName,
    icon:
      user.profilePicOverrideThumbnail || user.currentAvatarThumbnailImageUrl,
    service: "VRCHAT" as ExternalServiceName,
  };
};

const resolveDiscordUserId = async (
  serviceId: string,
  serviceAccount: ExternalServiceAccount,
): Promise<{
  name: string;
  icon?: string;
  service: ExternalServiceName;
}> => {
  const member = await prisma.memberExternalServiceAccount.findFirst({
    where: {
      service: "DISCORD",
      serviceId: serviceId,
      namespaceId: serviceAccount.namespaceId,
    },
  });
  if (member) {
    return {
      name: member.serviceUsername || member.name,
      icon: member.icon || undefined,
      service: "DISCORD" as ExternalServiceName,
    };
  }
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
  const member = await prisma.memberExternalServiceAccount.findFirst({
    where: {
      service: "DISCORD",
      serviceUsername: serviceId,
      namespaceId: serviceAccount.namespaceId,
    },
  });
  if (member) {
    return {
      name: member.serviceUsername || member.name,
      icon: member.icon || undefined,
      service: "DISCORD" as ExternalServiceName,
    };
  }
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const guilds = await prisma.externalServiceGroup.findMany({
    where: {
      accountId: serviceAccount.id,
    },
  });
  for (const guild of guilds) {
    const members = await getSearchGuildMembers(
      data.token,
      guild.groupId,
      serviceId,
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
