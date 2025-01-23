import {
  type VRChatCredentials,
  ZVRChatCredentials,
} from "@/types/credentials";
import type { ExternalServiceAccount } from "@prisma/client";
import { z } from "zod";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { UnauthorizedError, retry } from "../retry";
import { ZVRCGroupRole } from "../types/GroupRole";

export const getGroupRoles = retry(
  async (account: ExternalServiceAccount, groupId: string) => {
    const { credential } = account;
    const { token, twoFactorToken: twoFactorAuth } = ZVRChatCredentials.parse(
      JSON.parse(credential),
    );
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
      throw new UnauthorizedError(
        `Failed to get group: ${response.statusText}`,
      );
    }
    const data = z.array(ZVRCGroupRole).safeParse(await response.json());
    if (!data.success) {
      throw new Error(`Failed to get group: ${data.error.message}`);
    }
    return data.data;
  },
);
