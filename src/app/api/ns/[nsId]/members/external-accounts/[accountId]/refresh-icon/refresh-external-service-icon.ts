import { getUser } from "@/lib/discord/requests/getUser";
import type { DiscordUserId } from "@/lib/discord/types/user";
import { AccountNotFoundError } from "@/lib/exceptions/AccountNotFoundError";
import { generateInstallationAccessToken } from "@/lib/github/generateInstallationAccessToken";
import { getUserById } from "@/lib/github/requests/getUserById";
import type { GitHubAccountId } from "@/lib/github/types/Account";
import { ZGitHubGroupId } from "@/lib/github/types/encoded";
import { getExternalServiceGroupsByAccountId } from "@/lib/prisma/getExternalServiceGroupsByAccountId";
import { updateMemberExternalServiceAccountStatus } from "@/lib/prisma/updateMemberExternalServiceAccountStatus";
import { getUserById as getVRCUserById } from "@/lib/vrchat/requests/getUserById";
import type { VRCUserId } from "@/lib/vrchat/types/brand";
import { ZDiscordCredentials, ZGithubCredentials } from "@/types/credentials";
import type {
  TExternalServiceAccount,
  TMemberExternalServiceAccount,
} from "@/types/prisma";

export const refreshExternalServiceAccountIcon = async (
  serviceAccount: TExternalServiceAccount,
  memberAccount: TMemberExternalServiceAccount,
): Promise<string | undefined> => {
  try {
    switch (memberAccount.service) {
      case "DISCORD":
        return await refreshDiscordIcon(
          serviceAccount,
          memberAccount.serviceId as DiscordUserId,
        );
      case "VRCHAT":
        return await refreshVRChatIcon(
          serviceAccount,
          memberAccount.serviceId as VRCUserId,
        );
      case "GITHUB":
        return await refreshGitHubIcon(serviceAccount, memberAccount.serviceId);
      default:
        throw new Error(`Unsupported service: ${memberAccount.service}`);
    }
  } catch (error) {
    // アカウントが存在しない場合（AccountNotFoundError）はstatusをDELETEDに更新
    if (error instanceof AccountNotFoundError) {
      await updateMemberExternalServiceAccountStatus(
        memberAccount.namespaceId,
        memberAccount.id,
        "DELETED",
      );
      return undefined;
    }
    throw error;
  }
};

// 古い文字列ベースのエラーチェック関数は削除（もはや不要）

const refreshDiscordIcon = async (
  serviceAccount: TExternalServiceAccount,
  serviceId: DiscordUserId,
): Promise<string | undefined> => {
  const credentials = ZDiscordCredentials.parse(
    JSON.parse(serviceAccount.credential),
  );

  const user = await getUser(credentials.token, serviceId);

  return user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : undefined;
};

const refreshVRChatIcon = async (
  serviceAccount: TExternalServiceAccount,
  serviceId: VRCUserId,
): Promise<string | undefined> => {
  const user = await getVRCUserById(serviceAccount, serviceId);

  return (
    user.profilePicOverrideThumbnail || user.currentAvatarThumbnailImageUrl
  );
};

const refreshGitHubIcon = async (
  serviceAccount: TExternalServiceAccount,
  serviceId: string,
): Promise<string | undefined> => {
  const groups = await getExternalServiceGroupsByAccountId(
    serviceAccount.namespaceId,
    serviceAccount.id,
  );

  const group = groups[0];
  if (!group) {
    throw new Error("No GitHub group found for service account");
  }

  const { installationId } = ZGitHubGroupId.parse(JSON.parse(group.groupId));
  const token = await generateInstallationAccessToken(
    serviceAccount,
    installationId,
  );
  const user = await getUserById(token, Number(serviceId) as GitHubAccountId);

  return user.avatar_url;
};
