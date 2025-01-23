import { VRChatCredentials, ZVRChatCredentials } from "@/types/credentials";
import type { ExternalServiceAccount } from "@prisma/client";
import { prisma } from "../prisma";
import { getAuthTokens } from "./getAuthCookies";

type ArgsType<T> = T extends (
  ...args: infer U extends [ExternalServiceAccount, ...unknown[]] // biome-ignore lint/suspicious/noExplicitAny: tmp;
) => any
  ? U
  : never;
// biome-ignore lint/suspicious/noExplicitAny: tmp;
export const retry = <T extends (...args: any) => Promise<any>>(fn: T) => {
  return async (...args: ArgsType<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        const credentials = ZVRChatCredentials.parse(
          JSON.parse(args[0].credential),
        );
        const cred = await getAuthTokens(
          credentials.username,
          credentials.password,
          credentials.totp,
        );
        if (cred === undefined) {
          throw new UnauthorizedError();
        }
        const newCred = JSON.stringify({
          ...credentials,
          token: cred.token,
          twoFactorToken: cred.twoFactorToken,
          userId: cred.userId,
        });
        await prisma.externalServiceAccount.update({
          where: {
            id: args[0].id,
          },
          data: {
            credential: newCred,
          },
        });
        args[0] = {
          ...args[0],
          credential: newCred,
        };
        return await fn(...args);
      }
      throw e;
    }
  };
};

export class UnauthorizedError extends Error {}
