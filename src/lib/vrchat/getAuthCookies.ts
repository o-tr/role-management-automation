import { getTotpCode } from "../totp";
import { getAuth } from "./requests/getAuth";
import { getAuthUser } from "./requests/getAuthUser";
import { postAuthTwoFactorAuthTotp } from "./requests/postAuthTwoFactorAuthTotp";

export const getAuthTokens = async (
  username: string,
  password: string,
  totpSecret: string,
): Promise<{
  token: string;
  twoFactorToken: string;
}| undefined> => {
  try {
    const { token } = await getAuthUser(username, password);
    const totp = getTotpCode(totpSecret);
    const { twoFactorToken } = await postAuthTwoFactorAuthTotp(token, totp);
    const data = await getAuth(token, twoFactorToken);
    return data.ok ? { token, twoFactorToken } : undefined;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}