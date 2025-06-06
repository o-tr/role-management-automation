import { getTotpCode } from "../totp";
import { getAuthUser, getAuthUserWithAuth } from "./requests/getAuthUser";
import { postAuthTwoFactorAuthTotp } from "./requests/postAuthTwoFactorAuthTotp";
import type { VRCAuthUser } from "./types/AuthUser";
import type { VRCToken, VRCTwoFactorAuth, VRCUserId } from "./types/brand";

export const getAuthTokens = async (
  username: string,
  password: string,
  totpSecret: string,
): Promise<
  | {
      token: VRCToken;
      twoFactorToken: VRCTwoFactorAuth;
      userId: VRCUserId;
      user: VRCAuthUser;
    }
  | undefined
> => {
  try {
    const { token } = await getAuthUserWithAuth(username, password);
    const totp = getTotpCode(totpSecret);
    const { twoFactorToken } = await postAuthTwoFactorAuthTotp(token, totp);
    const user = await getAuthUser(token, twoFactorToken);
    return { token, twoFactorToken, userId: user.id, user };
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
