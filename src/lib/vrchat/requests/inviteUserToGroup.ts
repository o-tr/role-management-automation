import { requests } from "@/lib/requests";
import { ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { vrchatLimit } from "../plimit";
import { UnauthorizedError, retry } from "../retry";
import type { VRCGroupId, VRCUserId } from "../types/brand";

type InviteUserToGroupResult =
  | {
      status: "invited";
      message?: string;
    }
  | {
      status: "already";
      message?: string;
    };

export const inviteUserToGroup = retry(
  async (
    account: TExternalServiceAccount,
    groupId: VRCGroupId,
    userId: VRCUserId,
  ): Promise<InviteUserToGroupResult> => {
    const credentials = ZVRChatCredentials.parse(
      JSON.parse(account.credential),
    );
    const { token, twoFactorToken: twoFactorAuth } = credentials;
    const response = await vrchatLimit(() =>
      requests(`https://api.vrchat.cloud/api/1/groups/${groupId}/invites`, {
        method: "POST",
        headers: {
          Cookie: buildCookie({ token, twoFactorAuth }),
          "User-Agent": VRCHAT_USER_AGENT,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }),
    );

    let message: string | undefined;
    try {
      const data = await response.json();
      if (typeof data?.message === "string") {
        message = data.message;
      }
    } catch (error) {
      // VRChat sometimes returns empty bodies; ignore JSON parse failures.
      message = undefined;
    }

    if (response.status === 409) {
      return {
        status: "already",
        message,
      };
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedError(
          `Failed to invite user: ${response.statusText}`,
        );
      }
      throw new Error(`Failed to invite user: ${response.statusText}`);
    }

    return {
      status: "invited",
      message,
    };
  },
);
