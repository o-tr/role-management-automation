import type { ExternalServiceName } from "@prisma/client";
import { isValidBotToken } from "./discord";
import { isValidAccountCredential } from "./vrchat";

export const validateCredential = async (
  type: ExternalServiceName,
  credential: string,
) => {
  switch (type) {
    case "DISCORD":
      return await isValidBotToken(credential);
    case "VRCHAT":
      return await isValidAccountCredential(credential);
    default:
      return false;
  }
};
