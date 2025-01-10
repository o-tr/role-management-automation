import type { ExternalServiceName } from "@prisma/client";
import { isValidBotToken } from "./discord";
import { getAccountCredentials } from "./vrchat";

export const validateCredential = async (
  type: ExternalServiceName,
  credential: string,
): Promise<string|undefined> => {
  switch (type) {
    case "DISCORD":
      return await isValidBotToken(credential) ? credential : undefined;
    case "VRCHAT":
      return await getAccountCredentials(credential);
    default:
      return undefined;
  }
};
