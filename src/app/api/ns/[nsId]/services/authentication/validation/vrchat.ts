import { isValidCredential } from "@/lib/vrchat/isValidCredential";
import { ZVRChatCredentials } from "@/types/credentials";

export const isValidAccountCredential = async (credential: string) => {
  try {
    const data = ZVRChatCredentials.parse(JSON.parse(credential));
    return await isValidCredential(data.username, data.password, data.totp);
  } catch (e) {
    return false;
  }
};
