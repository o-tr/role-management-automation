import { z } from "zod";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { ZVRCGroupRole } from "../types/GroupRole";
import type { VRCToken, VRCTwoFactorAuth } from "../types/brand";

export const getGroupRoles = async (
  token: VRCToken,
  twoFactorAuth: VRCTwoFactorAuth,
  groupId: string,
) => {
  const response = await fetch(
    `https://api.vrchat.cloud/api/1/groups/${groupId}/roles`,
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
  const data = z.array(ZVRCGroupRole).safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to get group: ${data.error.message}`);
  }
  return data.data;
};
