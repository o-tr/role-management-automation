import { ZVRChatCredentials } from "@/types/credentials";
import type { ExternalServiceAccount } from "@prisma/client";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { UnauthorizedError, retry } from "../retry";
import { ZVRCUser } from "../types/User";
import type { VRCUserId } from "../types/brand";

export const getUserById = retry(
  async (account: ExternalServiceAccount, userId: VRCUserId) => {
    const { credential } = account;
    const { token, twoFactorToken } = ZVRChatCredentials.parse(
      JSON.parse(credential),
    );
    const response = await fetch(
      `https://api.vrchat.cloud/api/1/users/${userId}`,
      {
        method: "GET",
        headers: {
          Cookie: buildCookie({ token, twoFactorAuth: twoFactorToken }),
          "User-Agent": VRCHAT_USER_AGENT,
        },
      },
    );
    if (!response.ok) {
      throw new UnauthorizedError(
        `Failed to fetch user: ${response.statusText}`,
      );
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
