import { requests } from "@/lib/requests";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { type VRCAuth, ZVRCAuth } from "../types/Auth";
import type { VRCToken, VRCTwoFactorAuth } from "../types/brand";

export const getAuth = async (
  token: VRCToken,
  twoFactorAuth: VRCTwoFactorAuth,
): Promise<VRCAuth> => {
  const request = await requests("https://api.vrchat.cloud/api/1/auth", {
    headers: {
      "User-Agent": VRCHAT_USER_AGENT,
      Cookie: buildCookie({ token, twoFactorAuth }),
    },
  });
  if (!request.ok) {
    throw new Error(`Failed to validate token: ${request.statusText}`);
  }
  const data = ZVRCAuth.safeParse(await request.json());
  if (!data.success) {
    throw new Error(`Failed to validate token: ${JSON.stringify(data)}`);
  }
  return data.data;
};
