import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { ZVRCGroup } from "../types/Group";
import type { VRCToken, VRCTwoFactorAuth } from "../types/brand";

export const getGroup = async (
  token: VRCToken,
  twoFactorAuth: VRCTwoFactorAuth,
  groupId: string,
) => {
  console.log("getGroup", { token, twoFactorAuth, groupId });
  const response = await fetch(
    `https://api.vrchat.cloud/api/1/groups/${groupId}`,
    {
      headers: {
        Cookie: buildCookie({ token, twoFactorAuth }),
        "User-Agent": VRCHAT_USER_AGENT,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to get group: ${response.statusText}`);
  }
  const data = ZVRCGroup.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to get group: ${data.error.message}`);
  }
  return data.data;
};
