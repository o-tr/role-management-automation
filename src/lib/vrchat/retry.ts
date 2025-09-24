import { sleep } from "@/lib/sleep";
import { ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import { prisma } from "../prisma";
import { getAuthTokens } from "./getAuthCookies";

type ArgsType<T> = T extends (
  ...args: infer U extends [TExternalServiceAccount, ...unknown[]] // biome-ignore lint/suspicious/noExplicitAny: tmp;
) => any
  ? U
  : never;
// biome-ignore lint/suspicious/noExplicitAny: tmp;
export const retry = <T extends (...args: any) => Promise<any>>(
  fn: T,
  maxRateLimitRetries = 3,
) => {
  return async (...args: ArgsType<T>): Promise<ReturnType<T>> => {
    let rateLimitRetries = 0;

    const executeWithRetry = async (): Promise<ReturnType<T>> => {
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

        if (e instanceof RateLimitError) {
          if (rateLimitRetries < maxRateLimitRetries) {
            rateLimitRetries++;
            console.warn(
              `Rate limit hit, retrying after ${e.retryAfterMs}ms (attempt ${rateLimitRetries}/${maxRateLimitRetries})`,
            );
            await sleep(e.retryAfterMs);
            return executeWithRetry();
          }
          console.error(
            `Rate limit retry exhausted after ${maxRateLimitRetries} attempts`,
          );
        }

        throw e;
      }
    };

    return executeWithRetry();
  };
};

export class UnauthorizedError extends Error {}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfterMs = 60000, // デフォルト60秒
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}
