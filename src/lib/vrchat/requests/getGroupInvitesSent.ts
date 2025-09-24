import { requests } from "@/lib/requests";
import {
  type VRChatCredentials,
  ZVRChatCredentials,
} from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import { z } from "zod";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { vrchatLimit } from "../plimit";
import { UnauthorizedError, retry } from "../retry";
import { ZVRCGroup } from "../types/Group";
import { ZVRCGroupMember } from "../types/GroupMember";

type Options = {
  limit: number;
  offset: number;
};

export const getGroupInvitesSent = retry(
  async (
    account: TExternalServiceAccount,
    groupId: string,
    options: Options,
  ) => {
    const credentials = ZVRChatCredentials.parse(
      JSON.parse(account.credential),
    );
    const { token, twoFactorToken: twoFactorAuth } = credentials;
    const query = new URLSearchParams();
    query.append("n", options.limit.toString());
    query.append("offset", options.offset.toString());

    const response = await vrchatLimit(() =>
      requests(
        `https://api.vrchat.cloud/api/1/groups/${groupId}/invites?${query.toString()}`,
        {
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
    const data = z.array(ZVRCGroupMember).safeParse(await response.json());
    if (!data.success) {
      throw new Error(`Failed to get group: ${data.error.message}`);
    }
    return data.data;
  },
);
