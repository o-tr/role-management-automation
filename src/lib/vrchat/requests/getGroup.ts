import {
  type VRChatCredentials,
  ZVRChatCredentials,
} from "@/types/credentials";
import type { ExternalServiceAccount } from "@prisma/client";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { UnauthorizedError, retry } from "../retry";
import { ZVRCGroup } from "../types/Group";

export const getGroup = retry(
  async (account: ExternalServiceAccount, groupId: string) => {
    const credentials = ZVRChatCredentials.parse(
      JSON.parse(account.credential),
    );
    const { token, twoFactorToken: twoFactorAuth } = credentials;
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
      throw new UnauthorizedError(
        `Failed to get group: ${response.statusText}`,
      );
    }
    const data = ZVRCGroup.safeParse(await response.json());
    if (!data.success) {
      throw new Error(`Failed to get group: ${data.error.message}`);
    }
    return data.data;
  },
);
