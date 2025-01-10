import { getAuthTokens } from "@/lib/vrchat/getAuthCookies";
import { ZVRChatCredentialsInput } from "@/types/credentials";

export const getAccountCredentials = async (
  credential: string,
): Promise<
  | {
      credential: string;
      icon?: string;
    }
  | undefined
> => {
  try {
    const data = ZVRChatCredentialsInput.parse(JSON.parse(credential));
    const result = await getAuthTokens(data.username, data.password, data.totp);
    if (result === undefined) {
      return undefined;
    }
    return {
      credential: JSON.stringify({
        ...data,
        token: result.token,
        twoFactorToken: result.twoFactorToken,
        userId: result.userId,
      }),
      icon: result.user.currentAvatarThumbnailImageUrl,
    };
  } catch (e) {
    return undefined;
  }
};
