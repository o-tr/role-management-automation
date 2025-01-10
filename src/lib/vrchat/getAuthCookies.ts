import { getTotpCode } from "../totp";
import { getAuthUser, getAuthUserWithAuth } from "./requests/getAuthUser";
import { postAuthTwoFactorAuthTotp } from "./requests/postAuthTwoFactorAuthTotp";

export const getAuthTokens = async (
  username: string,
  password: string,
  totpSecret: string,
): Promise<{
  token: string;
  twoFactorToken: string;
  userId: string;
}| undefined> => {
  try {
    const { token } = await getAuthUserWithAuth(username, password);
    const totp = getTotpCode(totpSecret);
    const { twoFactorToken } = await postAuthTwoFactorAuthTotp(token, totp);
    const user = await getAuthUser(token, twoFactorToken);
    return { token, twoFactorToken, userId: user.id };
  } catch (e) {
    console.log(e);
    return undefined;
  }
}