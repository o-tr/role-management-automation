import { filterObject } from "@/lib/filterObject";
import { sleep } from "@/lib/sleep";
import { ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import type { ExternalServiceAccount } from "@prisma/client";
import { z } from "zod";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie } from "../cookie";
import { vrchatLimit } from "../plimit";
import { UnauthorizedError, retry } from "../retry";
import { ZVRCGroupMember } from "../types/GroupMember";
import type { VRCGroupId } from "../types/brand";

type Options = {
  offset?: number;
  limit?: number;
  sort?: "joinedAt:asc" | "joinedAt:desc";
  roleId?: string;
};

export const listGroupMembers = retry(
  async (
    account: TExternalServiceAccount,
    groupId: VRCGroupId,
    options: Options = {},
  ) => {
    const { credential } = account;
    const { token, twoFactorToken } = ZVRChatCredentials.parse(
      JSON.parse(credential),
    );
    const params = {
      offset: options.offset?.toString(),
      n: options.limit?.toString(),
      sort: options.sort,
      roleId: options.roleId,
    } as Record<string, string>;
    const query = new URLSearchParams(filterObject(params));
    const response = await vrchatLimit(() =>
      fetch(
        `https://api.vrchat.cloud/api/1/groups/${groupId}/members?${query.toString()}`,
        {
          method: "GET",
          headers: {
            Cookie: buildCookie({ token, twoFactorAuth: twoFactorToken }),
            "User-Agent": VRCHAT_USER_AGENT,
          },
        },
      ),
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    const json = await response.json();
    const data = z.array(ZVRCGroupMember).safeParse(json);
    if (!data.success) {
      console.error(data.error, json);
      throw new Error(
        `Failed to parse user groups: ${JSON.stringify(data.error)}`,
      );
    }
    return data.data;
  },
);
