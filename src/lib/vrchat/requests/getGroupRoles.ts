import { z } from "zod";
import { requests } from "@/lib/requests";
import { ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { vrchatLimit } from "../plimit";
import { retry, UnauthorizedError } from "../retry";
import { ZVRCGroupRole } from "../types/GroupRole";

export const getGroupRoles = retry(
  async (account: TExternalServiceAccount, groupId: string) => {
    const { credential } = account;
    const { token, twoFactorToken: twoFactorAuth } = ZVRChatCredentials.parse(
      JSON.parse(credential),
    );
    const response = await vrchatLimit(() =>
      requests(`https://api.vrchat.cloud/api/1/groups/${groupId}/roles`, {
        headers: {
          Cookie: buildCookie({ token, twoFactorAuth }),
          "User-Agent": VRCHAT_USER_AGENT,
        },
      }),
    );
    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedError(
          `Failed to get group: ${response.statusText}`,
        );
      }
      throw new Error(`Failed to get group: ${response.statusText}`);
    }
    const data = z.array(ZVRCGroupRole).safeParse(await response.json());
    if (!data.success) {
      throw new Error(`Failed to get group: ${data.error.message}`);
    }
    return data.data;
  },
);
