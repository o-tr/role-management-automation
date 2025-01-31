import { styleText } from "util";

const methodColor = {
  get: "bgGreen",
  post: "bgYellow",
  put: "bgBlue",
  patch: "bgMagenta",
  delete: "bgRed",
  head: "bgCyan",
  options: "bgGray",
} as const satisfies Record<string, string>;

export const requests = async (
  input: string | URL | globalThis.Request,
  init?: RequestInit,
) => {
  const response = await fetch(input, init);
  const method = (init?.method?.toLocaleLowerCase() ??
    "get") as keyof typeof methodColor;
  const url = typeof input === "string" ? input : input.toString();
  const isError = response.status >= 400;
  const text = `${styleText(
    isError ? "red" : "green",
    `${response.status} ${response.statusText}`,
  )} ${styleText(methodColor[method], `[${method}]`)} ${url}`;
  if (isError) {
    console.error(text);
  } else {
    console.log(text);
  }
  return response;
};
