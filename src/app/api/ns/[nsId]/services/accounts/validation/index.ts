import type { ExternalServiceName } from "@prisma/client";
import { isValidBotToken } from "./discord";
import { isValidGithubCredential } from "./github";
import { getAccountCredentials } from "./vrchat";

export const validateCredential = async (
  type: ExternalServiceName,
  credential: string,
): Promise<
  | {
      credential: string;
      icon?: string;
    }
  | undefined
> => {
  switch (type) {
    case "DISCORD":
      return await isValidBotToken(credential);
    case "VRCHAT":
      return await getAccountCredentials(credential);
    case "GITHUB":
      return await isValidGithubCredential(credential);
    default:
      return undefined;
  }
};
