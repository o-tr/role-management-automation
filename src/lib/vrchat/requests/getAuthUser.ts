import { requests } from "@/lib/requests";
import { VRCHAT_USER_AGENT } from "../const";
import { buildCookie, getAuthToken } from "../cookie";
import {
  type VRCAuthUserWithAuth,
  ZVRCAuthUser,
  ZVRCAuthUserWithAuth,
} from "../types/AuthUser";
import type { VRCToken, VRCTwoFactorAuth } from "../types/brand";

export const getAuthUserWithAuth = async (
  username: string,
  password: string,
): Promise<{
  data: VRCAuthUserWithAuth;
  token: VRCToken;
}> => {
  const response = await requests("https://api.vrchat.cloud/api/1/auth/user", {
    method: "GET",
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      "User-Agent": VRCHAT_USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  const authToken = getAuthToken(response.headers.getSetCookie());
  if (!authToken) {
    throw new Error(
      `Failed to get auth token: ${response.headers.getSetCookie()}`,
    );
  }
  const data = ZVRCAuthUserWithAuth.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse user: ${JSON.stringify(data.error)}`);
  }
  if (!data.data.requiresTwoFactorAuth.includes("totp")) {
    throw new Error(
      `Two factor auth is not supported: ${JSON.stringify(
        data.data.requiresTwoFactorAuth,
      )}`,
    );
  }
  return {
    data: data.data,
    token: authToken,
  };
};

export const getAuthUser = async (
  token: VRCToken,
  twoFactorAuth: VRCTwoFactorAuth,
) => {
  const response = await fetch("https://api.vrchat.cloud/api/1/auth/user", {
    method: "GET",
    headers: {
      Cookie: buildCookie({ token, twoFactorAuth }),
      "User-Agent": VRCHAT_USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  const data = ZVRCAuthUser.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse user: ${JSON.stringify(data.error)}`);
  }
  return data.data;
};
