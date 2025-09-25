import type { VRCToken, VRCTwoFactorAuth } from "./types/brand";

const getAuthToken = (cookies: string[]): VRCToken | undefined => {
  for (const cookie of cookies) {
    const [key, value] = cookie.split(";")[0].split("=");
    if (key === "auth") {
      return value as VRCToken;
    }
  }
  return;
};

const getTwoFactorAuthToken = (
  cookies: string[],
): VRCTwoFactorAuth | undefined => {
  for (const cookie of cookies) {
    const [key, value] = cookie.split(";")[0].split("=");
    if (key === "twoFactorAuth") {
      return value as VRCTwoFactorAuth;
    }
  }
  return;
};

const buildCookie = ({
  token,
  twoFactorAuth,
}: {
  token?: VRCToken;
  twoFactorAuth?: VRCTwoFactorAuth;
}) => {
  const result: string[] = [];
  if (token) result.push(`auth=${token}`);
  if (twoFactorAuth) result.push(`twoFactorAuth=${twoFactorAuth}`);
  return result.join("; ");
};

export { buildCookie, getAuthToken, getTwoFactorAuthToken };
