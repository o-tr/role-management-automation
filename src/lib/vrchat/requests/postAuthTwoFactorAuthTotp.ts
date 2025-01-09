import { VRCHAT_USER_AGENT } from "../const";
import { getTwoFactorAuthToken } from "../cookie";
import { ZVRCAuthTwoFactorAuthTotp } from "../types/AuthTwoFactorAuthTotp";

export const postAuthTwoFactorAuthTotp = async (token: string, code: string) => {
  const response = await fetch('https://api.vrchat.cloud/api/1/auth/twofactorauth/totp/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth=${token}`,
      'User-Agent': VRCHAT_USER_AGENT,
    },
    body: JSON.stringify({ code })
  });
  if (!response.ok) {
    console.log(await response.json(), `auth=${token}`, code)
    throw new Error(`Failed to verify totp: ${response.statusText}`);
  }
  const totpToken = getTwoFactorAuthToken(response.headers.getSetCookie())
  const data = ZVRCAuthTwoFactorAuthTotp.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse totp: ${JSON.stringify(data.error)}`);
  }
  return {
    data: data.data,
    twoFactorToken: totpToken,
  };
}
