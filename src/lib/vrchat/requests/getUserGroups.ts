import { ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { vrchatLimit } from "../plimit";
import { UnauthorizedError, retry } from "../retry";
import { ZVRCUserGroups } from "../types/UserGroups";

export const getUserGroups = retry(async (account: TExternalServiceAccount) => {
  const { credential } = account;
  const {
    token,
    twoFactorToken: twoFactorAuth,
    userId,
  } = ZVRChatCredentials.parse(JSON.parse(credential));
  const response = await vrchatLimit(() =>
    fetch(`https://api.vrchat.cloud/api/1/users/${userId}/groups`, {
      method: "GET",
      headers: {
        Cookie: buildCookie({ token, twoFactorAuth }),
        "User-Agent": VRCHAT_USER_AGENT,
      },
    }),
  );
  if (!response.ok) {
    throw new UnauthorizedError(
      `Failed to fetch user groups: ${response.statusText}`,
    );
  }
  const data = ZVRCUserGroups.safeParse(await response.json());
  if (!data.success) {
    throw new Error(
      `Failed to parse user groups: ${JSON.stringify(data.error)}`,
    );
  }
  return data.data;
});
