import { getAuthTokens } from "@/lib/vrchat/getAuthCookies";
import { ZVRChatCredentials } from "@/types/credentials";

export const getAccountCredentials = async (credential: string): Promise<string|undefined> => {
  try {
    const data = ZVRChatCredentials.parse(JSON.parse(credential));
    const result = await getAuthTokens(data.username, data.password, data.totp);
    if (result === undefined) {
      return undefined;
    }
    return JSON.stringify({...data,...result});
  } catch (e) {
    return undefined;
  }
};
