import pLimit from "p-limit";
import { z } from "zod";
import { sleep } from "../sleep";

const limit = pLimit(1);

export const discordLimit = <
  Arguments extends unknown[],
  ReturnType extends Response,
>(
  function_: (...arguments_: Arguments) => PromiseLike<ReturnType>,
  ...arguments_: Arguments
): Promise<ReturnType> => {
  return limit(() =>
    sleep(500).then(async () => {
      const response = await function_(...arguments_);
      if (response.status === 429) {
        const data = ZDiscordRateLimitResponse.parse(await response.json());
        await sleep(data.retry_after * 1000 * 1.5);
        return await function_(...arguments_);
      }
      return response;
    }),
  );
};

export const ZDiscordRateLimitResponse = z.object({
  message: z.string(),
  retry_after: z.number(),
  global: z.boolean(),
});
