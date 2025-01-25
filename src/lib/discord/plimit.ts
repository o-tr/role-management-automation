import pLimit from "p-limit";
import { sleep } from "../sleep";

const limit = pLimit(1);

export const discordLimit = <Arguments extends unknown[], ReturnType>(
  function_: (...arguments_: Arguments) => PromiseLike<ReturnType>,
  ...arguments_: Arguments
): Promise<ReturnType> => {
  return limit(() => sleep(500).then(() => function_(...arguments_)));
};
