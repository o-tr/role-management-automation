import { VRCHAT_USER_AGENT } from "../const";
import { getAuthToken } from "../cookie";
import { ZVRCAuthUser } from "../types/AuthUser";

export const getAuthUser = async (username: string, password: string) => {
  const response = await fetch('https://api.vrchat.cloud/api/1/auth/user', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      'User-Agent': VRCHAT_USER_AGENT,
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  const authToken = getAuthToken(response.headers.getSetCookie());
  const data =ZVRCAuthUser.safeParse(await response.json());
  console.log(data);
  if (!data.success) {
    throw new Error(`Failed to parse user: ${JSON.stringify(data.error)}`);
  }
  if (!data.data.requiresTwoFactorAuth.includes("totp")){
    throw new Error(`Two factor auth is not supported: ${JSON.stringify(data.data.requiresTwoFactorAuth)}`);
  }
  return {
    data: data.data,
    token: authToken,
  }
}
