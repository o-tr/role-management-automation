import { requests } from "@/lib/requests";
import { ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { vrchatLimit } from "../plimit";
import { UnauthorizedError, retry } from "../retry";
import { ZVRCUser } from "../types/User";
import type { VRCUserId } from "../types/brand";

export const getUserById = retry(
  async (account: TExternalServiceAccount, userId: VRCUserId) => {
    const { credential } = account;
    const { token, twoFactorToken } = ZVRChatCredentials.parse(
      JSON.parse(credential),
    );
    const response = await vrchatLimit(() =>
      requests(`https://api.vrchat.cloud/api/1/users/${userId}`, {
        method: "GET",
        headers: {
          Cookie: buildCookie({ token, twoFactorAuth: twoFactorToken }),
          "User-Agent": VRCHAT_USER_AGENT,
        },
      }),
    );
    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedError(
          `Failed to get user: ${response.statusText}`,
        );
      }
      throw new Error(`Failed to get user: ${response.statusText}`);
    }
    const json = await response.json();
    const data = ZVRCUser.safeParse(json);
    if (!data.success) {
      console.error(data.error, json);
      throw new Error(
        `Failed to parse user groups: ${JSON.stringify(data.error)}`,
      );
    }
    return data.data;
  },
);
