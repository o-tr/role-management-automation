import { requests } from "@/lib/requests";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie, getTwoFactorAuthToken } from "../cookie";
import {
  type VRCAuthTwoFactorAuthTotp,
  ZVRCAuthTwoFactorAuthTotp,
} from "../types/AuthTwoFactorAuthTotp";
import type { VRCToken, VRCTwoFactorAuth } from "../types/brand";

export const postAuthTwoFactorAuthTotp = async (
  token: VRCToken,
  code: string,
): Promise<{
  data: VRCAuthTwoFactorAuthTotp;
  twoFactorToken: VRCTwoFactorAuth;
}> => {
  const response = await requests(
    "https://api.vrchat.cloud/api/1/auth/twofactorauth/totp/verify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: buildCookie({ token }),
        "User-Agent": VRCHAT_USER_AGENT,
      },
      body: JSON.stringify({ code }),
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to verify totp: ${response.statusText}`);
  }
  const totpToken = getTwoFactorAuthToken(response.headers.getSetCookie());
  if (!totpToken) {
    throw new Error(
      `Failed to get totp token: ${response.headers.getSetCookie()}`,
    );
  }
  const data = ZVRCAuthTwoFactorAuthTotp.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse totp: ${JSON.stringify(data.error)}`);
  }
  return {
    data: data.data,
    twoFactorToken: totpToken,
  };
};
