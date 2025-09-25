import { requests } from "@/lib/requests";
import { ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import { z } from "zod";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { vrchatLimit } from "../plimit";
import { UnauthorizedError, retry } from "../retry";
import {
  type VRCGroupId,
  type VRCGroupRoleId,
  type VRCUserId,
  ZVRCGroupRoleId,
} from "../types/brand";

export const removeRoleFromGroupMember = retry(
  async (
    account: TExternalServiceAccount,
    groupId: VRCGroupId,
    userId: VRCUserId,
    roleId: VRCGroupRoleId,
  ) => {
    const credentials = ZVRChatCredentials.parse(
      JSON.parse(account.credential),
    );
    const { token, twoFactorToken: twoFactorAuth } = credentials;
    const response = await vrchatLimit(() =>
      requests(
        `https://api.vrchat.cloud/api/1/groups/${groupId}/members/${userId}/roles/${roleId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: buildCookie({ token, twoFactorAuth }),
            "User-Agent": VRCHAT_USER_AGENT,
          },
        },
      ),
    );
    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedError(
          `Failed to get group: ${response.statusText}`,
        );
      }
      throw new Error(`Failed to get group: ${response.statusText}`);
    }
    const data = z.array(ZVRCGroupRoleId).safeParse(await response.json());
    if (!data.success) {
      throw new Error(`Failed to get group: ${data.error.message}`);
    }
    return data.data;
  },
);
