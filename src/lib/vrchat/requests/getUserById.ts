import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { ZVRCUser } from "../types/User";
import type { VRCToken, VRCTwoFactorAuth, VRCUserId } from "../types/brand";

export const getUserById = async (
  token: VRCToken,
  twoFactorAuth: VRCTwoFactorAuth,
  userId: VRCUserId,
) => {
  const response = await fetch(
    `https://api.vrchat.cloud/api/1/users/${userId}`,
    {
      method: "GET",
      headers: {
        Cookie: buildCookie({ token, twoFactorAuth }),
        "User-Agent": VRCHAT_USER_AGENT,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch user groups: ${response.statusText}`);
  }
  const data = ZVRCUser.safeParse(await response.json());
  if (!data.success) {
    throw new Error(
      `Failed to parse user groups: ${JSON.stringify(data.error)}`,
    );
  }
  return data.data;
};
